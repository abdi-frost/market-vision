import type { MarketBias } from "@/types/analysis";

export interface PairBias {
  pair: string;
  bias: MarketBias | null;
  loading?: boolean;
}

export interface PairData {
  pair: string;
  latestPrice: number | null;
  bias: MarketBias | null;
}

// Re-export analysis types for convenience
export type {
  BiasDirection,
  MarketBias,
  FairValueGap,
  SwingPoint,
  LiquidityLevel,
  MarketStructureAnalysis,
  AnalysisData,
  Candle,
  Timeframe,
} from "@/types/analysis";
