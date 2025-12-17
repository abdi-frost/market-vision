import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LiquidityLevel } from "@/types/analysis";

interface LiquidityLevelsCardProps {
  irlLevels: LiquidityLevel[];
  erlLevels: LiquidityLevel[];
}

export function LiquidityLevelsCard({ irlLevels, erlLevels }: LiquidityLevelsCardProps) {
  const [activeTab, setActiveTab] = useState<"irl" | "erl">("irl");

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardTitle className="flex items-center gap-2">
          <span>💧</span> Liquidity Levels
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full">
          <div className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 w-full mb-4">
            <button
              onClick={() => setActiveTab("irl")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                activeTab === "irl"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                  : "hover:bg-white/50 dark:hover:bg-slate-950/50"
              }`}
            >
              IRL ({irlLevels.length})
            </button>
            <button
              onClick={() => setActiveTab("erl")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                activeTab === "erl"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                  : "hover:bg-white/50 dark:hover:bg-slate-950/50"
              }`}
            >
              ERL ({erlLevels.length})
            </button>
          </div>
          
          {activeTab === "irl" ? (
            <div className="space-y-2 max-h-50 overflow-y-auto">
              {irlLevels.map((level, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <span className="font-mono text-sm">{level.price.toFixed(5)}</span>
                  <Badge variant={level.side === "buy" ? "success" : "destructive"}>
                    {level.side}
                  </Badge>
                </div>
              ))}
              {irlLevels.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No IRL levels</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-50 overflow-y-auto">
              {erlLevels.map((level, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <span className="font-mono text-sm">{level.price.toFixed(5)}</span>
                  <Badge variant={level.side === "buy" ? "success" : "destructive"}>
                    {level.side}
                  </Badge>
                </div>
              ))}
              {erlLevels.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No ERL levels</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
