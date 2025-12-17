/**
 * Twelve Data API Service
 * Documentation: https://twelvedata.com/docs
 */

import { cacheService } from "./cache";
import type { Candle } from "@/types/analysis";

export type { Candle };

// Phase 1 defaults: always fetch TwelveData candles in NY time (DST-aware), JSON format,
// and in chronological order. This makes downstream handling consistent.
const DEFAULT_TIMEZONE = "America/New_York";
const DEFAULT_FORMAT = "JSON";
const DEFAULT_ORDER: "asc" | "desc" = "asc";

interface TwelveDataResponse {
  meta: {
    symbol: string;
    interval: string;
    currency_base?: string;
    currency_quote?: string;
    type?: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
  status: string;
}

/**
 * Fetch OHLC data from Twelve Data API with caching
 * @param symbol - The forex pair symbol (e.g., "EUR/USD")
 * @param interval - The time interval (e.g., "1day", "4h", "1h")
 * @param apiKey - The Twelve Data API key
 * @param outputsize - Number of data points to return
 * @param useMockData - Force use of mock data (for development/testing)
 * @returns Array of formatted candle data
 */
export async function fetchForexData(
  symbol: string,
  interval: string = "1day",
  apiKey: string,
  outputsize: number = 120,
  useMockData: boolean = false
): Promise<Candle[]> {
  const isProduction = process.env.NODE_ENV === "production";

  // Phase 1: pin these parameters for deterministic ingestion behavior.
  const timezone = DEFAULT_TIMEZONE;
  const format = DEFAULT_FORMAT;
  const order = DEFAULT_ORDER;

  // Create cache key based on request parameters.
  // Include timezone/order/format because they affect the returned dataset ordering.
  const cacheKey = `forex:${symbol}:${interval}:${outputsize}:${timezone}:${format}:${order}`;

  // Check if data exists in cache
  const cachedData = cacheService.get<Candle[]>(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${symbol} (${interval})`);
    return cachedData;
  }

  console.log(`Cache miss for ${symbol} (${interval}), fetching from API...`);

  // Build the request using URL + URLSearchParams to avoid encoding/concat bugs.
  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("outputsize", String(outputsize));
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("format", format);
  url.searchParams.set("order", order);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TwelveDataResponse = await response.json();

    if (data.status === "error") {
      throw new Error("API returned an error");
    }

    if (!data.values || data.values.length === 0) {
      return [];
    }

    // Convert API response to our Candle format.
    // We request `order=asc` above, so we expect values to already be chronological.
    const formattedData = data.values.map((item) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: item.volume ? parseFloat(item.volume) : undefined,
    }));

    // Store in cache with 5 minute TTL
    cacheService.set(cacheKey, formattedData, 5 * 60 * 1000);

    return formattedData;
  } catch (error) {
    console.error("Error fetching forex data from API:", error);

    // In production, don't fallback to mock data - throw the error
    throw new Error(
      `Failed to fetch data from API: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get the latest price for a forex pair
 * @param symbol - The forex pair symbol
 * @param apiKey - The Twelve Data API key
 */
export async function getLatestPrice(
  symbol: string,
  apiKey: string
): Promise<number | null> {
  try {
    const data = await fetchForexData(symbol, "1day", apiKey);
    if (data.length > 0) {
      return data[data.length - 1].close;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching latest price for ${symbol}:`, error);
    return null;
  }
}
