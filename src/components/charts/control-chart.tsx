"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ControlChartProps {
  data: Array<{ sampleNo: number; value: number }>;
  mean: number;
  ucl: number;
  lcl: number;
  label?: string;
}

export function ControlChart({ data, mean, ucl, lcl }: ControlChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sampleNo" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
        <Tooltip formatter={(val) => typeof val === "number" ? val.toFixed(3) : val} />
        <ReferenceLine y={mean} stroke="#2563eb" strokeDasharray="5 5" label="μ" />
        <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="3 3" label="UCL" />
        <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="3 3" label="LCL" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={1.5}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
