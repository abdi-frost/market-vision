"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { PairBias } from "@/types/market";

interface BiasSummaryPanelProps {
  pairBiases: PairBias[];
  onPairClick?: (pair: string) => void;
}

export function BiasSummaryPanel({ pairBiases, onPairClick }: BiasSummaryPanelProps) {
  const bullishPairs = pairBiases.filter((p) => p.bias?.bias === "bullish");
  const bearishPairs = pairBiases.filter((p) => p.bias?.bias === "bearish");
  const neutralPairs = pairBiases.filter(
    (p) => !p.bias || p.bias?.bias === "neutral"
  );

  const CategoryCard = ({
    title,
    pairs,
    icon: Icon,
    color,
    bgColor,
  }: {
    title: string;
    pairs: PairBias[];
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }) => (
    <div className={`${bgColor} rounded-2xl p-4 border border-slate-200 dark:border-slate-700`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {pairs.length}
        </span>
      </div>
      <div className="space-y-2">
        {pairs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No pairs found
          </p>
        ) : (
          pairs.map((pairBias, index) => (
            <motion.div
              key={pairBias.pair}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPairClick?.(pairBias.pair)}
              className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="font-medium">{pairBias.pair}</span>
              {pairBias.bias?.confidence && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {pairBias.bias.confidence.toFixed(0)}%
                </span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Market Bias Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryCard
          title="🟢 Bullish"
          pairs={bullishPairs}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/10"
        />
        <CategoryCard
          title="🔴 Bearish"
          pairs={bearishPairs}
          icon={TrendingDown}
          color="text-red-600 dark:text-red-500"
          bgColor="bg-red-50 dark:bg-red-900/10"
        />
        <CategoryCard
          title="⚪ Neutral"
          pairs={neutralPairs}
          icon={Minus}
          color="text-slate-600 dark:text-slate-400"
          bgColor="bg-slate-50 dark:bg-slate-900/10"
        />
      </CardContent>
    </Card>
  );
}
