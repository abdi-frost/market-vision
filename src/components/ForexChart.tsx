"use client";

import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ForexCandle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ForexChartProps {
  data: ForexCandle[];
  title?: string;
  symbol?: string;
  interval?: string;
  onIntervalChange?: (interval: string) => void;
}

// Custom candlestick shape component
interface CandlestickProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ForexCandle;
}

const Candlestick = (props: CandlestickProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  
  if (!payload) return null;

  const { open, high, low, close } = payload;
  const isBullish = close >= open;
  const color = isBullish ? "#22c55e" : "#000000"; // green for bullish, black for bearish

  // Calculate the scale factor based on the bar's positioning
  // The y value represents the top of the bar (high value)
  // The height represents the range from high to low
  const priceRange = high - low;
  const pixelPerPrice = priceRange > 0 ? height / priceRange : 0;

  // Calculate positions
  const highY = y;
  const lowY = y + height;
  const openY = y + (high - open) * pixelPerPrice;
  const closeY = y + (high - close) * pixelPerPrice;

  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

  const candleWidth = Math.max(width * 0.6, 2);
  const centerX = x + width / 2;

  return (
    <g>
      {/* High-Low wick line */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Candle body */}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip for candlestick chart
interface TooltipPayload {
  payload: {
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isBullish = data.close > data.open;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">
          {new Date(data.datetime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Open: <span className="font-medium text-slate-900 dark:text-slate-100">{data.open.toFixed(5)}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            High: <span className="font-medium text-slate-900 dark:text-slate-100">{data.high.toFixed(5)}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Low: <span className="font-medium text-slate-900 dark:text-slate-100">{data.low.toFixed(5)}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Close: <span className="font-medium text-slate-900 dark:text-slate-100">{data.close.toFixed(5)}</span>
          </p>
          <p className={`font-semibold ${isBullish ? "text-green-600" : "text-red-600"}`}>
            {isBullish ? "Bullish ▲" : "Bearish ▼"}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ForexChart({
  data,
  title = "OHLC Data",
  symbol,
  interval = "1day",
  onIntervalChange,
}: ForexChartProps) {
  const chartTitle = symbol ? `${symbol} - ${title}` : title;

  // Transform data to include a dummy value for the bar chart
  // The bar will use high-low range
  const chartData = data.map(candle => ({
    ...candle,
    range: candle.high - candle.low,
    baseValue: candle.low,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{chartTitle}</CardTitle>
          {onIntervalChange && (
            <div className="flex gap-2">
              <Button
                variant={interval === "4h" ? "default" : "outline"}
                size="sm"
                onClick={() => onIntervalChange("4h")}
              >
                4H
              </Button>
              <Button
                variant={interval === "1day" ? "default" : "outline"}
                size="sm"
                onClick={() => onIntervalChange("1day")}
              >
                Daily
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="datetime"
              tickFormatter={(value) => {
                const date = new Date(value);
                if (interval === "4h") {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }) + " " + date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    hour12: false,
                  });
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[
                (dataMin: number) => dataMin * 0.999,
                (dataMax: number) => dataMax * 1.001
              ]}
              tickFormatter={(value) => value.toFixed(5)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="high"
              shape={<Candlestick />}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
