"use client";

import type { UserBalance } from "@/lib/balances";
import { TrendingDown, TrendingUp } from "lucide-react";
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
    name: r.name.length > 12 ? `${r.name.slice(0, 11)}…` : r.name,
    fullName: r.name,
    net: r.net,
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/60">
          <TrendingUp className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Add expenses to see balances.
        </p>
      </div>
    );
  }

  const topCreditor = data.reduce(
    (a, b) => (b.net > a.net ? b : a),
    data[0]!,
  );
  const topDebtor = data.reduce((a, b) => (b.net < a.net ? b : a), data[0]!);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-emerald-700/80 dark:text-emerald-400/80">
              Net lent
            </p>
            <p className="truncate text-sm font-semibold">
              {topCreditor.fullName}
              <span className="ml-1 font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
                +${topCreditor.net.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-400">
            <TrendingDown className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-rose-700/80 dark:text-rose-400/80">
              Net owed
            </p>
            <p className="truncate text-sm font-semibold">
              {topDebtor.fullName}
              <span className="ml-1 font-mono tabular-nums text-rose-700 dark:text-rose-300">
                ${topDebtor.net.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="negGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={1} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border/40"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            width={52}
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "oklch(0.7 0.1 180 / 0.08)" }}
            formatter={(value) => [
              `$${Number(value ?? 0).toFixed(2)}`,
              "Net balance",
            ]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as
                | { fullName?: string }
                | undefined;
              return row?.fullName ?? "";
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid oklch(0.9 0.02 200 / 0.6)",
              background: "oklch(1 0 0 / 0.95)",
              backdropFilter: "blur(12px)",
              fontSize: "12px",
              boxShadow: "0 8px 24px -8px oklch(0 0 0 / 0.15)",
            }}
          />
          <Bar
            dataKey="net"
            radius={[8, 8, 0, 0]}
            maxBarSize={56}
            animationDuration={700}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.net >= 0 ? "url(#posGradient)" : "url(#negGradient)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
