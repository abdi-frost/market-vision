"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export function ForexChart({
  data,
  title = "OHLC Data",
  symbol,
}: ForexChartProps) {
  const chartTitle = symbol ? `${symbol} - ${title}` : title;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="datetime"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => value.toFixed(5)}
            />
            <Tooltip
              formatter={(value: number) => value.toFixed(5)}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="open"
              stroke="#8884d8"
              name="Open"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="high"
              stroke="#82ca9d"
              name="High"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#ffc658"
              name="Low"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#ff7300"
              name="Close"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
