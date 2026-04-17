"use client";

import type { UserBalance } from "@/lib/balances";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const POS = "#10b981";
const NEG = "#f43f5e";

export function BalanceBarChart({ rows }: { rows: UserBalance[] }) {
  const data = rows.map((r) => ({
    name:
      r.name.length > 12 ? `${r.name.slice(0, 11)}…` : r.name,
    fullName: r.name,
    net: r.net,
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Add expenses to see balances.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          width={52}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [
            `$${Number(value ?? 0).toFixed(2)}`,
            "Net balance",
          ]}
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as { fullName?: string } | undefined;
            return row?.fullName ?? "";
          }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e4e4e7",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="net" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.net >= 0 ? POS : NEG} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
