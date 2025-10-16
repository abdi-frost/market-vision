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
function generateMockForexData(symbol: string): Candle[] {
  const data: Candle[] = [];
  const basePrice = symbol.includes("JPY") ? 110.0 : 1.0;
  const variance = basePrice * 0.01;
  
  for (let i = 30; i >= 0; i--) {
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
 * @param useMockData - Force use of mock data (for development/testing)
 * @returns Array of formatted candle data
 */
export async function fetchForexData(
  symbol: string,
  interval: string = "1day",
  apiKey: string,
  useMockData: boolean = false
): Promise<Candle[]> {
  // Use mock data if explicitly requested or if API key is demo/test
  if (useMockData || apiKey.includes("demo") || apiKey.includes("test")) {
    console.log(`Using mock data for ${symbol}`);
    return generateMockForexData(symbol);
  }

  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
    symbol
  )}&interval=${interval}&apikey=${apiKey}&outputsize=30`;

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
    console.error("Error fetching forex data from API, falling back to mock data:", error);
    // Fallback to mock data if API fails
    return generateMockForexData(symbol);
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
