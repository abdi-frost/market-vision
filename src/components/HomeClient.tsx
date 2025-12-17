"use client";

import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ForexChart, ForexCandle } from "@/components/ForexChart";
import { ForexCard } from "@/components/ForexCard";
import { PredictionCard } from "@/components/PredictionCard";
import type { MarketBias } from "@/algorithms/fvgAnalysis";
import { motion } from "framer-motion";
import { ALL_FOREX_PAIRS } from "@/pairs";
import { Search } from "lucide-react";
import type { PairBias } from "@/types/market";

interface HomeClientProps {
  serverPairBiases: PairBias[];
  selectedPair?: string;
  onPairSelect?: (pair: string) => void;
}

// Client-side cache with TTL
interface CachedData {
  data: ForexCandle[];
  marketBias: MarketBias | null;
  usingMockData: boolean;
  timestamp: number;
}

const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const clientCache = new Map<string, CachedData>();

export function HomeClient({ serverPairBiases, selectedPair: externalSelectedPair, onPairSelect }: HomeClientProps) {
  const [internalSelectedPair, setInternalSelectedPair] = useState<string>("EUR/USD");
  const [data, setData] = useState<ForexCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [interval, setInterval] = useState<string>("1day");
  const [marketBias, setMarketBias] = useState<MarketBias | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Track ongoing requests to prevent duplicate fetches
  const ongoingRequests = useRef<Map<string, Promise<void>>>(new Map());

  // Use external selectedPair if provided, otherwise use internal state
  const selectedPair = externalSelectedPair || internalSelectedPair;
  
  // Handler for pair selection
  const handlePairSelect = (pair: string) => {
    if (onPairSelect) {
      onPairSelect(pair);
    } else {
      setInternalSelectedPair(pair);
    }
  };

  // Convert server pair biases to a Map for easy lookup
  const pairBiasesMap = new Map<string, PairBias>(
    serverPairBiases.map((pb) => [pb.pair, pb])
  );

  useEffect(() => {
    fetchMarketAnalysis(selectedPair, interval);
  }, [selectedPair, interval]);

  const fetchMarketAnalysis = async (symbol: string, timeInterval: string) => {
    // Create cache key
    const cacheKey = `${symbol}:${timeInterval}`;
    
    // Check if there's an ongoing request for this key
    const ongoingRequest = ongoingRequests.current.get(cacheKey);
    if (ongoingRequest) {
      await ongoingRequest;
      return;
    }
    
    // Check cache first
    const cached = clientCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CLIENT_CACHE_TTL) {
      console.log(`Client cache hit for ${symbol} (${timeInterval})`);
      setData(cached.data);
      setMarketBias(cached.marketBias);
      setUsingMockData(cached.usingMockData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Create promise for this request
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `/api/market-analysis?symbol=${encodeURIComponent(symbol)}&interval=${timeInterval}`
        );
        const result = await response.json();
        
        if (result.success) {
          const newData = result.data;
          const newMarketBias = result.analysis?.bias || null;
          const newUsingMockData = result.usingMockData || false;
          
          // Update cache
          clientCache.set(cacheKey, {
            data: newData,
            marketBias: newMarketBias,
            usingMockData: newUsingMockData,
            timestamp: Date.now(),
          });
          
          setData(newData);
          setMarketBias(newMarketBias);
          setUsingMockData(newUsingMockData);
        } else {
          setError(result.error || "Failed to fetch market analysis");
        }
      } catch (error) {
        console.error("Error fetching market analysis:", error);
        setError("Failed to fetch market analysis");
      } finally {
        setLoading(false);
        ongoingRequests.current.delete(cacheKey);
      }
    })();
    
    ongoingRequests.current.set(cacheKey, requestPromise);
    await requestPromise;
  };

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
  };

  // Use real prediction from market analysis instead of mock
  const biasValue = marketBias?.bias || "neutral";
  const prediction: "bullish" | "bearish" =
    biasValue === "neutral" ? "bearish" : biasValue;
  const confidence = marketBias?.confidence || 50;

  const latestData = data.length > 0 ? data[data.length - 1] : null;

  // Filter pairs based on search query
  const filteredPairs = ALL_FOREX_PAIRS.filter(pair => 
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get hot pairs (confidence > 70%)
  const hotPairs = serverPairBiases
    .filter((pairBias) => pairBias.bias && pairBias.bias.confidence >= 70)
    .map((pairBias) => ({ pair: pairBias.pair, bias: pairBias.bias }));

  // Top 3 quick access pairs
  const topPairs = ["EUR/USD", "GBP/USD", "USD/JPY"];

  return (
    <>
      {/* Hot Pairs Marquee - Pairs with 70%+ confidence */}
      {hotPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">🔥 Hot Pairs</span>
            <span className="text-xs text-green-600 dark:text-green-500">(70%+ Confidence)</span>
          </div>
          <div className="flex gap-3 sm:gap-4 animate-marquee whitespace-nowrap">
            {hotPairs.map(({ pair, bias }) => (
              <div
                key={pair}
                onClick={() => handlePairSelect(pair)}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-lg border border-green-200 dark:border-green-700 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm"
              >
                <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">{pair}</span>
                <span className={`text-xs sm:text-sm font-bold ${bias?.bias === "bullish" ? "text-green-600" : "text-red-600"}`}>
                  {bias?.bias === "bullish" ? "📈" : "📉"} {bias?.confidence}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Mock Data Banner */}
      {usingMockData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4"
        >
          <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
            📊 Using mock data for demonstration. To use live data, set a valid
            TWELVE_API_KEY in your .env.local file.
          </p>
          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 mt-2">
            Get your free API key from{" "}
            <a
              href="https://twelvedata.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-700"
            >
              Twelve Data
            </a>
          </p>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 items-start">
        {/* Prediction Card */}
        {loading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 sm:p-4"
          >
            <p className="text-sm sm:text-base text-red-800 dark:text-red-200">{error}</p>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 mt-2">
              Make sure to set TWELVE_API_KEY in your .env.local file
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PredictionCard
              prediction={prediction}
              confidence={confidence}
              symbol={selectedPair}
              reason={marketBias?.reason}
            />
          </motion.div>
        )}

        {/* Market Summary */}
        {!loading && !error && latestData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full grid grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Open</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">{latestData.open.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">High</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">{latestData.high.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Low</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">{latestData.low.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Close</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">{latestData.close.toFixed(5)}</p>
            </div>
          </motion.div>
        )}

      </div>

      {/* Chart */}
      {loading ? (
        <Skeleton className="h-80 sm:h-96 w-full rounded-xl" />
      ) : !error && data.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ForexChart
            data={data}
            title={
              interval === "4h"
                ? "1-Week 4H OHLC Data"
                : "1-Month Daily OHLC Data"
            }
            symbol={selectedPair}
            interval={interval}
            onIntervalChange={handleIntervalChange}
          />
        </motion.div>
      ) : null}

      {/* Top 3 Quick Access Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 sm:space-y-4"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {topPairs.map((pair) => {
            const pairBias = pairBiasesMap.get(pair);
            return (
              <motion.div
                key={pair}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
              >
                <ForexCard
                  pair={pair}
                  latestPrice={
                    pair === selectedPair ? latestData?.close || null : null
                  }
                  isSelected={pair === selectedPair}
                  onClick={() => handlePairSelect(pair)}
                  loading={loading && pair === selectedPair}
                  bias={pairBias?.bias?.bias || null}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* all Forex Pairs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 sm:space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
            All Forex Pairs
          </h2>
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search pairs (e.g., EUR, USD, GBP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredPairs.map((pair, index) => {
            const pairBias = pairBiasesMap.get(pair);
            return (
              <motion.div
                key={pair}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + index * 0.05 }}
              >
                <ForexCard
                  pair={pair}
                  latestPrice={
                    pair === selectedPair ? latestData?.close || null : null
                  }
                  isSelected={pair === selectedPair}
                  onClick={() => handlePairSelect(pair)}
                  loading={loading && pair === selectedPair}
                  bias={pairBias?.bias?.bias || null}
                />
              </motion.div>
            );
          })}
        </div>
        {filteredPairs.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No pairs found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </motion.div>
    </>
  );
}
