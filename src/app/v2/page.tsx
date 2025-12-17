"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UPDATE_PAIRS } from "@/pairs";
import { RefreshCcw } from "lucide-react";
import type {
    AnalysisData,
    ApiResponse,
    LatestAnalysisResponse,
    Timeframe,
} from "@/types/analysis";
import { PairListItem } from "@/components/v2/PairListItem";
import { MarketBiasCard } from "@/components/v2/MarketBiasCard";
import { FVGCard } from "@/components/v2/FVGCard";
import { SwingPointsCard } from "@/components/v2/SwingPointsCard";
import { LiquidityLevelsCard } from "@/components/v2/LiquidityLevelsCard";

export default function AnalysisV2() {
    const [allAnalyses, setAllAnalyses] = useState<AnalysisData[]>([]);
    const [selectedPair, setSelectedPair] = useState("EUR/USD");
    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("1day");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all analyses on mount
    useEffect(() => {
        fetchSymbolAnalysis();
    }, [selectedPair, selectedTimeframe]);

    const fetchSymbolAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            const symbol = selectedPair.replace("/", "");
            const response = await fetch(`/api/analysis/latest?symbol=${symbol}&timeframe=${selectedTimeframe}`);
            const data: ApiResponse<LatestAnalysisResponse> = await response.json();

            if (data.success && data.data) {
                // The API returns two shapes:
                // 1) For symbol-specific: { symbol, timeframe, analyses, count }
                // 2) For all symbols: { pairs: [...], count, timeframeFilter }
                if ((data.data as any).pairs) {
                    setAllAnalyses((data.data as any).pairs || []);
                } else if ((data.data as any).analyses) {
                    const d = data.data as any;
                    const analysesArr = d.analyses as any[];
                    const latest = analysesArr[0];
                    const formatted = [
                        {
                            symbol: (d.symbol as string)?.replace('/', ''),
                            timeframe: latest?.timeframe ?? selectedTimeframe,
                            latestAnalysis: latest,
                            allTimeframes: analysesArr,
                            lastUpdated: latest?.timestamp,
                        } as AnalysisData,
                    ];
                    setAllAnalyses(formatted);
                } else {
                    setAllAnalyses([]);
                }
            } else {
                setError(data.error?.message || "Failed to fetch analyses");
            }
        } catch (err) {
            setError("Network error. Please check if the cron job has run.");
        } finally {
            setLoading(false);
        }
    };

    // Get the selected analysis based on pair and timeframe
    const selectedAnalysis = allAnalyses.find(
        (a) => a.symbol === selectedPair.replace("/", "") && a.timeframe === selectedTimeframe
    );

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
                <div className="max-w-450 mx-auto">
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={fetchSymbolAnalysis} variant="outline">
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 p-4 sm:p-6 lg:p-8">
            <div className="max-w-450 mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Market Analysis Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Advanced technical analysis powered by ICT Concepts
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {UPDATE_PAIRS.length} Pairs Tracked
                        </Badge>
                        <Button onClick={fetchSymbolAnalysis} variant="ghost" size="sm">
                            <RefreshCcw size={14} />
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Sidebar - Pair List */}
                    <div className="xl:col-span-3 space-y-4">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Trading Pairs</CardTitle>
                                <CardDescription>Select a pair to analyze</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                {UPDATE_PAIRS.map((pair) => (
                                    <PairListItem
                                        key={pair}
                                        pair={pair}
                                        analyses={allAnalyses}
                                        selectedPair={selectedPair}
                                        onSelect={setSelectedPair}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    {loading ? (
                        <div className="col-span-9 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
                            <div className="w-full mx-auto space-y-6">
                                <Skeleton className="h-12 w-full" />
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Skeleton className="h-56 lg:col-span-3" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="xl:col-span-9 space-y-6">
                            {/* Timeframe Selector */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex gap-2 max-w-md">
                                        <Button
                                            variant={selectedTimeframe === "1day" ? "default" : "outline"}
                                            onClick={() => setSelectedTimeframe("1day")}
                                            className="flex-1"
                                        >
                                            Daily (1D)
                                        </Button>
                                        <Button
                                            variant={selectedTimeframe === "4h" ? "default" : "outline"}
                                            onClick={() => setSelectedTimeframe("4h")}
                                            className="flex-1"
                                        >
                                            4 Hour (4H)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chart Card */}
                            <Card className="overflow-hidden">
                                <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">{selectedPair}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {selectedTimeframe === "1day" ? "Daily" : "4-Hour"} Chart with Technical Analysis
                                            </CardDescription>
                                        </div>
                                        {selectedAnalysis && (
                                            <Badge variant="outline" className="text-xs">
                                                Updated: {new Date(selectedAnalysis.lastUpdated).toLocaleString()}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
{/*                                 
                                    <div className="h-150 w-full">
                                        <ForexChart data={[]} symbol={selectedPair} interval={selectedTimeframe} />
                                    </div> */}
                                </CardContent>
                            </Card>

                            {/* Analysis Details Grid */}
                            {selectedAnalysis && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Market Bias Card */}
                                    {selectedAnalysis.latestAnalysis?.analysis && (
                                        <MarketBiasCard analysis={selectedAnalysis.latestAnalysis.analysis} />
                                    )}

                                    {/* Fair Value Gaps
                                    {selectedAnalysis.latestAnalysis?.analysis && (
                                        <FVGCard fvgs={selectedAnalysis.latestAnalysis.analysis.fvgs} />
                                    )} */}

                                    {/* Swing Points */}
                                    {selectedAnalysis.latestAnalysis?.analysis && (
                                        <SwingPointsCard
                                            swingHigh={selectedAnalysis.latestAnalysis.analysis.swingHigh}
                                            swingLow={selectedAnalysis.latestAnalysis.analysis.swingLow}
                                        />
                                    )}

                                    {/* Liquidity Levels */}
                                    {selectedAnalysis.latestAnalysis?.analysis && (
                                        <LiquidityLevelsCard
                                            irlLevels={selectedAnalysis.latestAnalysis.analysis.irlLevels}
                                            erlLevels={selectedAnalysis.latestAnalysis.analysis.erlLevels}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Metadata Card */}
                            {selectedAnalysis?.latestAnalysis?.metadata && (
                                <Card className="border-slate-200 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Analysis Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Candles Analyzed</p>
                                                <p className="text-xl font-bold">
                                                    {selectedAnalysis.latestAnalysis.metadata.candleCount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Candle</p>
                                                <p className="text-sm font-medium">
                                                    {selectedAnalysis.latestAnalysis.metadata.lastCandleTime}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Analysis Time</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(selectedAnalysis.latestAnalysis.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Timeframe</p>
                                                <Badge variant="outline">{selectedTimeframe}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
