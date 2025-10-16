"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PredictionCardProps {
  prediction: "bullish" | "bearish" | null;
  confidence?: number;
  symbol?: string;
}

export function PredictionCard({
  prediction,
  confidence = 0,
  symbol,
}: PredictionCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {prediction === "bullish" ? (
            <>
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span>Predicted Next Day Trend: Bullish 📈</span>
            </>
          ) : prediction === "bearish" ? (
            <>
              <TrendingDown className="h-6 w-6 text-red-600" />
              <span>Predicted Next Day Trend: Bearish 📉</span>
            </>
          ) : (
            <span>Predicted Next Day Trend: Analyzing...</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {symbol
              ? `Based on ${symbol} historical data analysis`
              : "Based on historical data analysis"}
          </p>
          {prediction && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Confidence
                </p>
                <p className="text-2xl font-bold">{confidence}%</p>
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
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Note: This is a mock prediction. Algorithmic prediction will be
            implemented in future updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
