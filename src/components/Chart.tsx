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

export interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartProps {
  data: OHLCData[];
  title?: string;
}

export function Chart({ data, title = "OHLC Data" }: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="open"
              stroke="#8884d8"
              name="Open"
            />
            <Line
              type="monotone"
              dataKey="high"
              stroke="#82ca9d"
              name="High"
            />
            <Line type="monotone" dataKey="low" stroke="#ffc658" name="Low" />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#ff7300"
              name="Close"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
