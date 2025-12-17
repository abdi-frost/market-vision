import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MarketStructureAnalysis, BadgeVariant, BiasDirection } from "@/types/analysis";

interface MarketBiasCardProps {
  analysis: MarketStructureAnalysis;
}

export function MarketBiasCard({ analysis }: MarketBiasCardProps) {
  const getBiasVariant = (bias: BiasDirection): BadgeVariant => {
    switch (bias) {
      case "bullish":
        return "success";
      case "bearish":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "bg-green-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> Market Bias
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Direction</span>
          <Badge
            variant={getBiasVariant(analysis.bias.bias)}
            className="text-base px-4 py-1"
          >
            {analysis.bias.bias.toUpperCase()}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Confidence Level</span>
            <span className="font-bold text-lg">
              {analysis.bias.confidence}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={analysis.bias.confidence}
              className="h-3"
            />
            <div
              className={`absolute inset-0 h-3 rounded-full transition-all ${getConfidenceColor(
                analysis.bias.confidence
              )}`}
              style={{
                width: `${analysis.bias.confidence}%`,
              }}
            />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Reason</p>
          <p className="text-sm font-medium">
            {analysis.bias.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
