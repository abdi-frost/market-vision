/**
 * Configuration for cron job data updates
 */

import { UPDATE_PAIRS } from "@/pairs";
import type { Timeframe } from "@/types/analysis";

export const CRON_CONFIG = {
  // Pairs to fetch and analyze
  pairs: UPDATE_PAIRS,
  
  // Timeframes to analyze
  timeframes: ["1day", "4h"] as const satisfies readonly Timeframe[],
  
  // Number of candles to fetch for each timeframe
  candleCounts: {
    "1day": 120, // 4 months of daily data
    "4h": 168,   // 4 weeks of 4h data
  } as Record<string, number>,
  
  // Data retention settings
  retention: {
    maxCandlesPerPair: 10000,      // Maximum candles to keep per pair/timeframe
    maxAnalysesPerPair: 10000,     // Maximum analyses to keep per pair/timeframe
    deleteOlderThanDays: 1800,    // Delete data older than 6 months
  },
};
