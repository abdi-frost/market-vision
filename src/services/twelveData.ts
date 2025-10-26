/**
 * Twelve Data API Service
 * Documentation: https://twelvedata.com/docs
 */

export interface Candle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Generate mock forex data for development and testing
 */
function generateMockForexData(symbol: string, outputsize: number = 120): Candle[] {
  const data: Candle[] = [];
  const basePrice = symbol.includes("JPY") ? 110.0 : 1.0;
  const variance = basePrice * 0.01;
  
  for (let i = outputsize - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const randomOpen = basePrice + (Math.random() - 0.5) * variance * 2;
    const randomChange = (Math.random() - 0.5) * variance;
    const high = randomOpen + Math.abs(randomChange) * 1.5;
    const low = randomOpen - Math.abs(randomChange) * 1.5;
    const close = randomOpen + randomChange;
    
    data.push({
      datetime: date.toISOString().split('T')[0],
      open: parseFloat(randomOpen.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });
  }
  
  return data;
}

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
 * Fetch OHLC data from Twelve Data API
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
  const isDemoKey = apiKey.includes("demo") || apiKey.includes("test");
  
  // In development, use mock data if explicitly requested or if using demo/test key
  if (!isProduction && (useMockData || isDemoKey)) {
    console.log(`[DEV] Using mock data for ${symbol} with ${outputsize} data points`);
    return generateMockForexData(symbol, outputsize);
  }

  // In production with demo key, warn but still try to use the API
  if (isProduction && isDemoKey) {
    console.warn(`[PROD] Using demo/test API key - data may not be real`);
  }

  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
    symbol
  )}&interval=${interval}&apikey=${apiKey}&outputsize=${outputsize}`;

  try {
    const response = await fetch(url, {
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

    // Convert API response to our Candle format
    return data.values.map((item) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    })).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error("Error fetching forex data from API:", error);
    
    // In production, don't fallback to mock data - throw the error
    if (isProduction) {
      throw new Error(`Failed to fetch data from API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // In development, fallback to mock data
    console.log("[DEV] Falling back to mock data");
    return generateMockForexData(symbol, outputsize);
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
