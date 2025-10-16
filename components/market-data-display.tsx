'use client';

import { CandlestickData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp } from 'lucide-react';

interface MarketDataDisplayProps {
  data: CandlestickData[];
  title: string;
}

export function MarketDataDisplay({ data, title }: MarketDataDisplayProps) {
  if (data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  
  const change = latest.close - previous.close;
  const changePercent = (change / previous.close) * 100;
  const isPositive = change >= 0;

  // Calculate some statistics
  const high24h = Math.max(...data.slice(-5).map(d => d.high));
  const low24h = Math.min(...data.slice(-5).map(d => d.low));
  const volume = latest.volume || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Price */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">${latest.close.toFixed(2)}</p>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span className="text-sm font-semibold">
                  {Math.abs(changePercent).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <p className="text-xs text-gray-600 font-medium">High</p>
              </div>
              <p className="text-lg font-semibold">${high24h.toFixed(2)}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-600 rotate-180" />
                <p className="text-xs text-gray-600 font-medium">Low</p>
              </div>
              <p className="text-lg font-semibold">${low24h.toFixed(2)}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded border col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <p className="text-xs text-gray-600 font-medium">Volume</p>
              </div>
              <p className="text-lg font-semibold">{(volume / 1000000).toFixed(2)}M</p>
            </div>
          </div>

          {/* OHLC Data */}
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-2">OHLC Data</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Open</p>
                <p className="font-semibold">${latest.open.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">High</p>
                <p className="font-semibold">${latest.high.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Low</p>
                <p className="font-semibold">${latest.low.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Close</p>
                <p className="font-semibold">${latest.close.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
