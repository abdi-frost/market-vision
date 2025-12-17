import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FairValueGap } from "@/types/analysis";

interface FVGCardProps {
  fvgs: FairValueGap[];
}

export function FVGCard({ fvgs }: FVGCardProps) {
  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardTitle className="flex items-center gap-2">
          <span>⚡</span> Fair Value Gaps
        </CardTitle>
        <CardDescription>
          {fvgs.length} FVGs Detected
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-75 overflow-y-auto">
          {fvgs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No Fair Value Gaps detected
            </p>
          ) : (
            fvgs.map((fvg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  fvg.direction === "bullish"
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={fvg.direction === "bullish" ? "success" : "destructive"}
                  >
                    {fvg.direction === "bullish" ? "🔼" : "🔽"} {fvg.direction}
                  </Badge>
                  <Badge variant={fvg.isFilled ? "secondary" : "outline"}>
                    {fvg.isFilled ? "Filled" : "Open"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Start:</span>
                    <span className="ml-1 font-medium">{fvg.start.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">End:</span>
                    <span className="ml-1 font-medium">{fvg.end.toFixed(5)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
