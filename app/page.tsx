'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { CandlestickChart } from '@/components/candlestick-chart';
import { PredictionCard } from '@/components/prediction-card';
import { MarketDataDisplay } from '@/components/market-data-display';
import { fetchDailyData, fetchIntradayData, convertTo4Hour } from '@/lib/api';
import { predictNextDay } from '@/lib/analysis';
import { CandlestickData, PredictionResult } from '@/lib/types';
import { RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';

export default function Home() {
  const [symbol, setSymbol] = useState('IBM');
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<CandlestickData[]>([]);
  const [fourHourData, setFourHourData] = useState<CandlestickData[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch daily data
      const daily = await fetchDailyData(symbol);
      setDailyData(daily);

      // Fetch intraday data and convert to 4-hour
      const intraday = await fetchIntradayData(symbol, '60min');
      const fourHour = convertTo4Hour(intraday);
      setFourHourData(fourHour);

      // Generate prediction
      const predictionResult = predictNextDay(daily, fourHour);
      setPrediction(predictionResult);
    } catch (err) {
      setError('Failed to fetch market data. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Market Vision</h1>
                <p className="text-sm text-gray-600">Algorithmic Market Prediction</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Symbol (e.g., AAPL)"
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <Button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!loading && dailyData.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Market Vision</h2>
              <p className="text-gray-600 mb-4">
                Enter a stock symbol and click Analyze to get started with algorithmic market analysis.
              </p>
              <p className="text-sm text-gray-500">
                Example symbols: IBM, AAPL, MSFT, GOOGL
              </p>
            </CardContent>
          </Card>
        )}

        {dailyData.length > 0 && (
          <div className="space-y-6">
            {/* Symbol Info */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
              <CardHeader>
                <CardTitle className="text-3xl">{symbol}</CardTitle>
                <CardDescription className="text-blue-100">
                  Real-time market analysis and prediction
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Prediction Result */}
            {prediction && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PredictionCard prediction={prediction} />
                </div>
                <div className="space-y-6">
                  <MarketDataDisplay data={dailyData} title="Daily Overview" />
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Timeframe</CardTitle>
                  <CardDescription>Last 30 trading days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <CandlestickChart data={dailyData} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4-Hour Timeframe</CardTitle>
                  <CardDescription>Recent intraday data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <CandlestickChart data={fourHourData} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This tool provides algorithmic market analysis for educational purposes only. 
                  The predictions are based on historical data and technical indicators, and should not be considered as 
                  financial advice. Always conduct your own research and consult with financial professionals before making 
                  investment decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2025 Market Vision. All rights reserved.</p>
            <p>Powered by algorithmic analysis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
