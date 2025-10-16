"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Chart, OHLCData } from "@/components/Chart";
import { predictNextDay, getPredictionConfidence } from "@/algorithms/predictNextDay";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetch-data?symbol=AAPL");
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

  const prediction = data.length > 0 ? predictNextDay(data) : null;
  const confidence = data.length > 0 ? getPredictionConfidence(data) : 0;
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Market Vision
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            AI-powered financial market prediction and analysis
          </p>
        </div>

        {/* Prediction Card */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {prediction === "bullish" ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Next Day Prediction: Bullish 📈
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-6 w-6 text-red-600" />
                    Next Day Prediction: Bearish 📉
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Based on latest OHLC data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Date
                    </p>
                    <p className="text-lg font-semibold">
                      {latestData?.date || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Close
                    </p>
                    <p className="text-lg font-semibold">
                      ${latestData?.close.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Confidence
                    </p>
                    <p className="text-lg font-semibold">{confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Trend
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        prediction === "bullish"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {prediction?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Latest Open</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  ${latestData?.open.toFixed(2) || "N/A"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Day High</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  ${latestData?.high.toFixed(2) || "N/A"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Day Low</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  ${latestData?.low.toFixed(2) || "N/A"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart Preview */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Chart data={data.slice(-7)} title="Last 7 Days OHLC Data" />
        )}

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
