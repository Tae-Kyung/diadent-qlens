"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HistogramProps {
  values: number[];
  usl?: number | null;
  lsl?: number | null;
  bins?: number;
  label?: string;
}

export function Histogram({
  values,
  usl,
  lsl,
  bins = 15,
}: HistogramProps) {
  if (values.length === 0) return <p className="text-muted-foreground text-sm">데이터 없음</p>;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins || 0.001;

  const buckets = Array.from({ length: bins }, (_, i) => ({
    range: (min + i * binWidth).toFixed(3),
    count: 0,
  }));

  for (const v of values) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    buckets[idx].count++;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={buckets} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" tick={{ fontSize: 9 }} interval={2} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" />
        {usl != null && <ReferenceLine x={undefined} stroke="#ef4444" label="USL" />}
        {lsl != null && <ReferenceLine x={undefined} stroke="#ef4444" label="LSL" />}
      </BarChart>
    </ResponsiveContainer>
  );
}
