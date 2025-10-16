import { OHLCData } from "@/components/Chart";

/**
 * Mock OHLC data for testing
 */
export const mockOHLCData: OHLCData[] = [
  { date: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { date: "2024-01-02", open: 105, high: 115, low: 100, close: 112 },
  { date: "2024-01-03", open: 112, high: 120, low: 108, close: 118 },
  { date: "2024-01-04", open: 118, high: 125, low: 115, close: 120 },
  { date: "2024-01-05", open: 120, high: 130, low: 118, close: 128 },
  { date: "2024-01-08", open: 128, high: 135, low: 125, close: 132 },
  { date: "2024-01-09", open: 132, high: 138, low: 130, close: 135 },
  { date: "2024-01-10", open: 135, high: 140, low: 132, close: 138 },
  { date: "2024-01-11", open: 138, high: 145, low: 135, close: 142 },
  { date: "2024-01-12", open: 142, high: 148, low: 140, close: 145 },
  { date: "2024-01-15", open: 145, high: 150, low: 142, close: 148 },
  { date: "2024-01-16", open: 148, high: 152, low: 145, close: 150 },
  { date: "2024-01-17", open: 150, high: 155, low: 148, close: 152 },
  { date: "2024-01-18", open: 152, high: 158, low: 150, close: 155 },
  { date: "2024-01-19", open: 155, high: 160, low: 152, close: 158 },
];

/**
 * Fetch OHLC data from API or return mock data
 * In production, this would fetch from a real financial API
 */
export async function fetchOHLCData(): Promise<OHLCData[]> {
  // For now, return mock data
  // In future, integrate with APIs like:
  // - Twelve Data: https://twelvedata.com/docs
  // - Alpha Vantage: https://www.alphavantage.co/documentation/
  // - Finnhub: https://finnhub.io/docs/api

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockOHLCData;
}
