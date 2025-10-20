import type { MarketBias } from "@/algorithms/fvgAnalysis";

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
