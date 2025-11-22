"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ForexCardProps {
  pair: string;
  latestPrice: number | null;
  isSelected?: boolean;
  onClick: () => void;
  loading?: boolean;
  bias?: "bullish" | "bearish" | "neutral" | null;
}

export function ForexCard({
  pair,
  latestPrice,
  isSelected = false,
  onClick,
  loading = false,
  bias = null,
}: ForexCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "border-2 border-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-bold">{pair}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 sm:space-y-2">
          {loading ? (
            <p className="text-xs sm:text-sm text-slate-500">Loading...</p>
          ) : latestPrice ? (
            <>
              <p className="text-xl sm:text-2xl font-bold">
                {latestPrice.toFixed(5)}
              </p>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                {bias === "bullish" ? (
                  <>
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-green-600">Bullish</span>
                  </>
                ) : bias === "bearish" ? (
                  <>
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <span className="text-red-600">Bearish</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                    <span className="text-slate-500">Neutral</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500">No data</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
