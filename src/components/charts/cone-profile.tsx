"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface ProfileData {
  label: string;
  mean: number;
  upper3s: number;
  lower3s: number;
  nominal?: number | null;
}

export function ConeProfile({ data }: { data: ProfileData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
        <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
        <Tooltip
          formatter={(val) => typeof val === "number" ? val.toFixed(4) : val}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Area
          type="monotone"
          dataKey="upper3s"
          stroke="none"
          fill="#3b82f6"
          fillOpacity={0.1}
        />
        <Area
          type="monotone"
          dataKey="lower3s"
          stroke="none"
          fill="#3b82f6"
          fillOpacity={0.1}
        />
        <Line
          type="monotone"
          dataKey="mean"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
        <Line
          type="monotone"
          dataKey="nominal"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
