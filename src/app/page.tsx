"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ForexChart, ForexCandle } from "@/components/ForexChart";
import { ForexCard } from "@/components/ForexCard";
import { PredictionCard } from "@/components/PredictionCard";
import Link from "next/link";

const MAJOR_FOREX_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "NZD/USD",
  "USD/CAD",
];

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<string>("EUR/USD");
  const [data, setData] = useState<ForexCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [interval, setInterval] = useState<string>("1day");

  useEffect(() => {
    fetchForexData(selectedPair, interval);
  }, [selectedPair, interval]);

  const fetchForexData = async (symbol: string, timeInterval: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/forex?symbol=${encodeURIComponent(symbol)}&interval=${timeInterval}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setUsingMockData(result.usingMockData || false);
      } else {
        setError(result.error || "Failed to fetch forex data");
      }
    } catch (error) {
      console.error("Error fetching forex data:", error);
      setError("Failed to fetch forex data");
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
  };

  // Mock prediction - will be replaced with actual algorithm
  const mockPrediction: "bullish" | "bearish" = 
    data.length > 0 && data[data.length - 1]?.close > data[0]?.close 
      ? "bullish" 
      : "bearish";
  const mockConfidence = 72;

  const latestData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Market Vision - Forex Prediction
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time forex market data and AI-powered predictions
          </p>
        </div>

        {/* Mock Data Banner */}
        {usingMockData && !loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200">
              📊 Using mock data for demonstration. To use live data, set a valid TWELVE_API_KEY in your .env.local file.
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
          </div>
        )}

        {/* Prediction Card */}
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-2">
              Make sure to set TWELVE_API_KEY in your .env.local file
            </p>
          </div>
        ) : (
          <PredictionCard
            prediction={mockPrediction}
            confidence={mockConfidence}
            symbol={selectedPair}
          />
        )}

        {/* Market Summary */}
        {!loading && !error && latestData && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Open</p>
              <p className="text-2xl font-bold">{latestData.open.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">High</p>
              <p className="text-2xl font-bold">{latestData.high.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Low</p>
              <p className="text-2xl font-bold">{latestData.low.toFixed(5)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Close</p>
              <p className="text-2xl font-bold">{latestData.close.toFixed(5)}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : !error && data.length > 0 ? (
          <ForexChart
            data={data}
            title={interval === "4h" ? "1-Week 4H OHLC Data" : "1-Month Daily OHLC Data"}
            symbol={selectedPair}
            interval={interval}
            onIntervalChange={handleIntervalChange}
          />
        ) : null}

        {/* Major Forex Pairs Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Major Forex Pairs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MAJOR_FOREX_PAIRS.map((pair) => (
              <ForexCard
                key={pair}
                pair={pair}
                latestPrice={pair === selectedPair ? latestData?.close || null : null}
                isSelected={pair === selectedPair}
                onClick={() => setSelectedPair(pair)}
                loading={loading && pair === selectedPair}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/analyze">
            <Button size="lg" className="text-lg px-8">
              View Full Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
