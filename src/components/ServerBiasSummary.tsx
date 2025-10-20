"use client";

import { BiasSummaryPanel } from "./BiasSummaryPanel";
import type { PairBias } from "@/types/market";

interface ServerBiasSummaryProps {
  serverPairBiases: PairBias[];
  onPairClick?: (pair: string) => void;
}

export function ServerBiasSummary({ serverPairBiases, onPairClick }: ServerBiasSummaryProps) {
  return <BiasSummaryPanel pairBiases={serverPairBiases} onPairClick={onPairClick} />;
}
