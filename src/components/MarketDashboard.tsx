"use client";

import { useState } from "react";
import { HomeClient } from "@/components/HomeClient";
import { ServerBiasSummary } from "@/components/ServerBiasSummary";
import type { PairBias } from "@/types/market";

interface MarketDashboardProps {
  serverPairBiases: PairBias[];
}

export function MarketDashboard({ serverPairBiases }: MarketDashboardProps) {
  const [selectedPair, setSelectedPair] = useState<string>("EUR/USD");

  const handlePairClick = (pair: string) => {
    setSelectedPair(pair);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Chart and Prediction (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        <HomeClient 
          serverPairBiases={serverPairBiases} 
          selectedPair={selectedPair}
          onPairSelect={setSelectedPair}
        />
      </div>

      {/* Right Column - Bias Summary Panel (1 column) */}
      <div className="lg:col-span-1">
        <ServerBiasSummary 
          serverPairBiases={serverPairBiases} 
          onPairClick={handlePairClick}
        />
      </div>
    </div>
  );
}
