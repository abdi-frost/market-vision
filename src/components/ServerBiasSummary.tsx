import { BiasSummaryPanel } from "./BiasSummaryPanel";
import { fetchForexData } from "@/services/twelveData";
import { analyzeMarketStructure } from "@/algorithms/fvgAnalysis";
import { ALL_FOREX_PAIRS } from "@/pairs";

async function fetchPairBias(pair: string) {
  try {
    const apiKey = process.env.TWELVE_API_KEY || "demo_api_key";
    const data = await fetchForexData(pair, "1day", apiKey, 120);

    if (!data || data.length === 0) {
      return { pair, bias: null };
    }

    const analysis = analyzeMarketStructure(data);
    return { pair, bias: analysis.bias };
  } catch (error) {
    console.error(`Error fetching bias for ${pair}:`, error);
    return { pair, bias: null };
  }
}

export async function ServerBiasSummary() {
  // Fetch all pair biases in parallel
  const pairBiases = await Promise.all(
    ALL_FOREX_PAIRS.map((pair) => fetchPairBias(pair))
  );

  return <BiasSummaryPanel pairBiases={pairBiases} />;
}
