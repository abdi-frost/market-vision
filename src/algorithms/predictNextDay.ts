import { OHLCData } from "@/components/Chart";

export type Prediction = "bullish" | "bearish";

/**
 * Simple prediction algorithm based on OHLC data
 * Returns "bullish" if close > open, otherwise "bearish"
 * In future, this can be enhanced with technical indicators
 */
export function predictNextDay(data: OHLCData[]): Prediction {
  if (!data || data.length === 0) {
    return "bearish";
  }

  // Get the most recent day's data
  const latestDay = data[data.length - 1];

  // Simple logic: if close > open, predict bullish, otherwise bearish
  if (latestDay.close > latestDay.open) {
    return "bullish";
  } else {
    return "bearish";
  }
}

/**
 * Get prediction confidence as a percentage
 */
export function getPredictionConfidence(data: OHLCData[]): number {
  if (!data || data.length === 0) {
    return 0;
  }

  const latestDay = data[data.length - 1];
  const priceChange = Math.abs(latestDay.close - latestDay.open);
  const priceRange = latestDay.high - latestDay.low;

  if (priceRange === 0) {
    return 50;
  }

  // Confidence based on how much of the day's range was covered
  const confidence = (priceChange / priceRange) * 100;
  return Math.min(Math.round(confidence), 100);
}
