"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ForexChart, ForexCandle } from "@/components/ForexChart";
import { ForexCard } from "@/components/ForexCard";
import { PredictionCard } from "@/components/PredictionCard";
import Link from "next/link";
import type { MarketBias } from "@/algorithms/fvgAnalysis";
import { motion } from "framer-motion";

const MAJOR_FOREX_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "NZD/USD",
  "USD/CAD",
];

interface PairBias {
  pair: string;
  bias: MarketBias | null;
  loading: boolean;
}

export function HomeClient() {
  const [selectedPair, setSelectedPair] = useState<string>("EUR/USD");
  const [data, setData] = useState<ForexCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [interval, setInterval] = useState<string>("1day");
  const [marketBias, setMarketBias] = useState<MarketBias | null>(null);
  const [pairBiases, setPairBiases] = useState<Map<string, PairBias>>(
    new Map()
  );

  useEffect(() => {
    fetchMarketAnalysis(selectedPair, interval);
  }, [selectedPair, interval]);

  // Fetch initial bias for all major pairs on mount
  useEffect(() => {
    const fetchAllPairBiases = async () => {
      for (const pair of MAJOR_FOREX_PAIRS) {
        setPairBiases((prev) =>
          new Map(prev).set(pair, { pair, bias: null, loading: true })
        );

        try {
          const response = await fetch(
            `/api/market-analysis?symbol=${encodeURIComponent(pair)}&interval=1day`
          );
          const result = await response.json();

          if (result.success && result.analysis?.bias) {
            setPairBiases((prev) =>
              new Map(prev).set(pair, {
                pair,
                bias: result.analysis.bias,
                loading: false,
              })
            );
          } else {
            setPairBiases((prev) =>
              new Map(prev).set(pair, { pair, bias: null, loading: false })
            );
          }
        } catch (error) {
          console.error(`Error fetching bias for ${pair}:`, error);
          setPairBiases((prev) =>
            new Map(prev).set(pair, { pair, bias: null, loading: false })
          );
        }
      }
    };

    fetchAllPairBiases();
  }, []);

  const fetchMarketAnalysis = async (symbol: string, timeInterval: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/market-analysis?symbol=${encodeURIComponent(symbol)}&interval=${timeInterval}`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setMarketBias(result.analysis?.bias || null);
        setUsingMockData(result.usingMockData || false);
      } else {
        setError(result.error || "Failed to fetch market analysis");
      }
    } catch (error) {
      console.error("Error fetching market analysis:", error);
      setError("Failed to fetch market analysis");
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      {/* Mock Data Banner */}
      {usingMockData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4"
        >
          <p className="text-blue-800 dark:text-blue-200">
            📊 Using mock data for demonstration. To use live data, set a valid
            TWELVE_API_KEY in your .env.local file.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
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

      {/* Prediction Card */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Open</p>
            <p className="text-2xl font-bold">{latestData.open.toFixed(5)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">High</p>
            <p className="text-2xl font-bold">{latestData.high.toFixed(5)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Low</p>
            <p className="text-2xl font-bold">{latestData.low.toFixed(5)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Close</p>
            <p className="text-2xl font-bold">{latestData.close.toFixed(5)}</p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
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

      {/* Major Forex Pairs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Major Forex Pairs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MAJOR_FOREX_PAIRS.map((pair, index) => {
            const pairBias = pairBiases.get(pair);
            return (
              <motion.div
                key={pair}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <ForexCard
                  pair={pair}
                  latestPrice={
                    pair === selectedPair ? latestData?.close || null : null
                  }
                  isSelected={pair === selectedPair}
                  onClick={() => setSelectedPair(pair)}
                  loading={loading && pair === selectedPair}
                  bias={pairBias?.bias?.bias || null}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Link href="/analyze">
          <Button size="lg" className="text-lg px-8 rounded-xl shadow-lg">
            View Full Analysis
          </Button>
        </Link>
      </motion.div>
    </>
  );
}
