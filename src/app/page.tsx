import { MarketDashboard } from "@/components/MarketDashboard";
import { fetchForexData } from "@/services/twelveData";
import { analyzeMarketStructure } from "@/algorithms/fvgAnalysis";
import { ALL_FOREX_PAIRS } from "@/pairs";
import type { PairBias } from "@/types/market";

async function fetchAllPairBiases(): Promise<PairBias[]> {
  const pairBiases = await Promise.all(
    ALL_FOREX_PAIRS.map(async (pair) => {
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
    })
  );

  return pairBiases;
}

export default async function Home() {
  const serverPairBiases = await fetchAllPairBiases();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <MarketDashboard serverPairBiases={serverPairBiases} />
      </div>
    </div>
  );
}
