"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ForexCardProps {
  pair: string;
  latestPrice: number | null;
  isSelected?: boolean;
  onClick: () => void;
  loading?: boolean;
}

export function ForexCard({
  pair,
  latestPrice,
  isSelected = false,
  onClick,
  loading = false,
}: ForexCardProps) {
  // Simple mock trend for visual feedback - in real app, calculate from data
  const trend = latestPrice ? (latestPrice % 2 > 1 ? "up" : "down") : "neutral";

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "border-2 border-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{pair}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : latestPrice ? (
            <>
              <p className="text-2xl font-bold">
                {latestPrice.toFixed(5)}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {trend === "up" ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Bullish</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Bearish</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No data</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
