"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PredictionCardProps {
  prediction: "bullish" | "bearish" | null;
  confidence?: number;
  symbol?: string;
  reason?: string;
}

export function PredictionCard({
  prediction,
  confidence = 0,
  symbol,
  reason,
}: PredictionCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {prediction === "bullish" ? (
            <>
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span>Market Bias: Bullish 📈</span>
            </>
          ) : prediction === "bearish" ? (
            <>
              <TrendingDown className="h-6 w-6 text-red-600" />
              <span>Market Bias: Bearish 📉</span>
            </>
          ) : (
            <span>Market Bias: Analyzing...</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {symbol
              ? `Based on ${symbol} FVG and liquidity analysis`
              : "Based on FVG and liquidity analysis"}
          </p>
          {prediction && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Confidence
                  </p>
                  <p className="text-2xl font-bold">{confidence}%</p>
                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        prediction === "bullish"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Direction
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      prediction === "bullish" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {prediction.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {prediction === "bullish" 
                      ? "Expected upward movement" 
                      : "Expected downward movement"}
                  </p>
                </div>
              </div>
              
              {/* Additional Analysis Details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Market Structure
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {prediction === "bullish" ? "Higher Highs" : "Lower Lows"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Signal Strength
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {confidence >= 80 ? "Very Strong" : confidence >= 70 ? "Strong" : confidence >= 60 ? "Moderate" : "Weak"}
                  </p>
                </div>
              </div>
            </>
          )}
          {reason && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Analysis:</strong> {reason}
              </p>
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Using ICT Smart Money Concepts: Fair Value Gaps (FVG) and Internal/External Range Liquidity (IRL/ERL)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
