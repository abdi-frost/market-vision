import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SwingPoint } from "@/types/analysis";

interface SwingPointsCardProps {
  swingHigh: SwingPoint | null;
  swingLow: SwingPoint | null;
}

export function SwingPointsCard({ swingHigh, swingLow }: SwingPointsCardProps) {
  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardTitle className="flex items-center gap-2">
          <span>📍</span> Swing Points
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {swingHigh && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                🔺 Swing High
              </span>
              <Badge variant="destructive">Resistance</Badge>
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-300">
              {swingHigh.price.toFixed(5)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {new Date(swingHigh.timestamp).toLocaleDateString()}
            </div>
          </div>
        )}
        {swingLow && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                🔻 Swing Low
              </span>
              <Badge variant="success">Support</Badge>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              {swingLow.price.toFixed(5)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {new Date(swingLow.timestamp).toLocaleDateString()}
            </div>
          </div>
        )}
        {!swingHigh && !swingLow && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No swing points detected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
