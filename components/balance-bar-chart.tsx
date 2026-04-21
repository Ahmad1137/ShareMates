"use client";

import type { UserBalance } from "@/lib/balances";
import { Wallet } from "lucide-react";
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

export function BalanceBarChart({ rows }: { rows: UserBalance[] }) {
  const data = rows.map((r) => ({
    name: r.name.length > 12 ? `${r.name.slice(0, 11)}…` : r.name,
    fullName: r.name,
    paid: r.paid,
    share: r.share,
    net: r.net,
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/60">
          <Wallet className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Add expenses to see balances.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-xs text-muted-foreground">
        <strong className="text-foreground">How to read this:</strong> each
        person’s <span className="font-medium text-foreground">share</span> is
        their part of the bills (from splits).{" "}
        <span className="font-medium text-foreground">Paid</span> is cash they
        put in. The bar is{" "}
        <span className="font-medium text-foreground">paid − share</span>{" "}
        (positive = covered more than your share; negative = still owe your
        share vs what you paid).
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <li
            key={r.userId}
            className="rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 text-sm"
          >
            <p className="truncate font-medium">{r.name}</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              Share ${r.share.toFixed(2)} · Paid ${r.paid.toFixed(2)}
              <span
                className={
                  r.net >= 0
                    ? " text-emerald-700 dark:text-emerald-400"
                    : " text-rose-700 dark:text-rose-400"
                }
              >
                {" "}
                · Balance {r.net >= 0 ? "+" : ""}${r.net.toFixed(2)}
              </span>
            </p>
          </li>
        ))}
      </ul>

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
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              if (name === "paid") return [`$${v.toFixed(2)}`, "Paid"];
              if (name === "share") return [`$${v.toFixed(2)}`, "Share"];
              return [`$${v.toFixed(2)}`, "Paid − share"];
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as
                | {
                    fullName?: string;
                    paid?: number;
                    share?: number;
                    net?: number;
                  }
                | undefined;
              if (!row?.fullName) return "";
              return `${row.fullName} · share $${Number(row.share ?? 0).toFixed(2)} · paid $${Number(row.paid ?? 0).toFixed(2)}`;
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
            name="net"
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
