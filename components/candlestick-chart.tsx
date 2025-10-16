'use client';

import { CandlestickData } from '@/lib/types';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface CandlestickChartProps {
  data: CandlestickData[];
  title?: string;
}

export function CandlestickChart({ data, title }: CandlestickChartProps) {
  // Take only the last 30 data points for better visualization
  const displayData = data.slice(-30);
  
  // Transform data for the chart
  const chartData = displayData.map((candle) => ({
    time: new Date(candle.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    // For candlestick effect
    body: candle.close >= candle.open ? [candle.open, candle.close] : [candle.close, candle.open],
    wick: [candle.low, candle.high],
    isGreen: candle.close >= candle.open,
    fill: candle.close >= candle.open ? '#10b981' : '#ef4444',
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { time: string; open: number; high: number; low: number; close: number; isGreen: boolean } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{data.time}</p>
          <p className="text-sm">Open: ${data.open.toFixed(2)}</p>
          <p className="text-sm">High: ${data.high.toFixed(2)}</p>
          <p className="text-sm">Low: ${data.low.toFixed(2)}</p>
          <p className="text-sm">Close: ${data.close.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${data.isGreen ? 'text-green-600' : 'text-red-600'}`}>
            {data.isGreen ? '▲' : '▼'} {Math.abs(data.close - data.open).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Wicks (high-low lines) */}
          <Bar 
            dataKey="wick" 
            fill="#666"
            shape={(props: unknown) => {
              const { x, y, width, height } = props as { x: number; y: number; width: number; height: number };
              const centerX = x + width / 2;
              const wickY1 = y;
              const wickY2 = y + height;
              
              return (
                <line
                  x1={centerX}
                  y1={wickY1}
                  x2={centerX}
                  y2={wickY2}
                  stroke="#666"
                  strokeWidth={1}
                />
              );
            }}
          />
          
          {/* Candle bodies */}
          <Bar 
            dataKey="body"
            fill="#10b981"
            shape={(props: unknown) => {
              const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { fill: string } };
              return (
                <rect
                  x={x + width * 0.3}
                  y={y}
                  width={width * 0.4}
                  height={height}
                  fill={payload.fill}
                  stroke={payload.fill}
                  strokeWidth={1}
                />
              );
            }}
          />
          
          {/* Moving average line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
