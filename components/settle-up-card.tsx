"use client";

import type { UserBalance } from "@/lib/balances";
import { computeSettlements } from "@/lib/settle-up";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettleUpCard({ rows }: { rows: UserBalance[] }) {
  const settlements = computeSettlements(rows);

  return (
    <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Settle-up</CardTitle>
        <CardDescription>
          Suggested payments to clear balances with minimum transfers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {settlements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Group is already settled.</p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((s, idx) => (
              <li
                key={`${s.fromUserId}-${s.toUserId}-${idx}`}
                className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{s.fromName}</span> pays{" "}
                <span className="font-medium">{s.toName}</span>{" "}
                <span className="font-mono font-semibold">${s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
