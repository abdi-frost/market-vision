"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart, OHLCData } from "@/components/Chart";
import {
  predictNextDay,
  getPredictionConfidence,
} from "@/algorithms/predictNextDay";

export default function AnalyzePage() {
  const [data, setData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("AAPL");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fetch-data?symbol=${symbol}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await fetchData();
    setTimeout(() => setAnalyzing(false), 500);
  };

  const prediction = data.length > 0 ? predictNextDay(data) : null;
  const confidence = data.length > 0 ? getPredictionConfidence(data) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Market Analysis
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            View detailed OHLC data and trigger algorithmic predictions
          </p>
        </div>

        {/* Symbol Input */}
        <Card>
          <CardHeader>
            <CardTitle>Select Symbol</CardTitle>
            <CardDescription>
              Enter a stock symbol to analyze (e.g., AAPL, GOOGL, MSFT)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="max-w-xs"
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || loading}
                className="flex items-center gap-2"
              >
                {analyzing || loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Full Chart */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Chart data={data} title={`${symbol} - Full OHLC Data`} />
        )}

        {/* Data Table */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>OHLC Data Details</CardTitle>
              <CardDescription>
                Showing {data.length} data points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-2 font-semibold text-slate-900 dark:text-slate-50">Date</th>
                      <th className="text-right p-2 font-semibold text-slate-900 dark:text-slate-50">Open</th>
                      <th className="text-right p-2 font-semibold text-slate-900 dark:text-slate-50">High</th>
                      <th className="text-right p-2 font-semibold text-slate-900 dark:text-slate-50">Low</th>
                      <th className="text-right p-2 font-semibold text-slate-900 dark:text-slate-50">Close</th>
                      <th className="text-right p-2 font-semibold text-slate-900 dark:text-slate-50">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const change = item.close - item.open;
                      const changePercent = (change / item.open) * 100;
                      const isPositive = change >= 0;
                      return (
                        <tr key={index} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="p-2 text-slate-900 dark:text-slate-50">{item.date}</td>
                          <td className="text-right p-2 text-slate-900 dark:text-slate-50">
                            ${item.open.toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-slate-900 dark:text-slate-50">
                            ${item.high.toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-slate-900 dark:text-slate-50">
                            ${item.low.toFixed(2)}
                          </td>
                          <td className="text-right p-2 text-slate-900 dark:text-slate-50">
                            ${item.close.toFixed(2)}
                          </td>
                          <td
                            className={`text-right p-2 font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {changePercent.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prediction Result */}
        {!loading && (
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {prediction === "bullish" ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Algorithmic Prediction: Bullish 📈
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-6 w-6 text-red-600" />
                    Algorithmic Prediction: Bearish 📉
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Based on simple OHLC analysis algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">Prediction Details</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      The algorithm analyzes the latest OHLC data to predict
                      whether the next day is likely to be bullish or bearish.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Current logic: If close &gt; open, predict bullish;
                      otherwise bearish.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">Confidence Score</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            prediction === "bullish"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{confidence}%</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Confidence based on price movement within the day&apos;s range
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
