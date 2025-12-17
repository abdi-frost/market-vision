import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalysisData, BadgeVariant, BiasDirection } from "@/types/analysis";

interface PairListItemProps {
  pair: string;
  analyses: AnalysisData[];
  selectedPair: string;
  onSelect: (pair: string) => void;
}

export function PairListItem({ pair, analyses, selectedPair, onSelect }: PairListItemProps) {
  const pairAnalyses = analyses.filter(
    (a) => a.symbol === pair.replace("/", "")
  );
  const dailyAnalysis = pairAnalyses.find((a) => a.timeframe === "1day");
  const bias = dailyAnalysis?.latestAnalysis?.analysis?.bias;

  const getBiasVariant = (biasDir: BiasDirection): BadgeVariant => {
    switch (biasDir) {
      case "bullish":
        return "success";
      case "bearish":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <button
      onClick={() => onSelect(pair)}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selectedPair === pair
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-md"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">{pair}</span>
        {bias && (
          <Badge variant={getBiasVariant(bias.bias)}>
            {bias.bias}
          </Badge>
        )}
      </div>
      {bias && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Confidence</span>
            <span className="font-medium">{bias.confidence}%</span>
          </div>
          <Progress value={bias.confidence} className="h-1" />
        </div>
      )}
    </button>
  );
}
