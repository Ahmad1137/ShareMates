import type { UserBalance } from "@/lib/balances";

export type Settlement = {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
};

export function computeSettlements(rows: UserBalance[]): Settlement[] {
  const creditors = rows
    .filter((r) => r.net > 0.009)
    .map((r) => ({ ...r, remaining: r.net }))
    .sort((a, b) => b.remaining - a.remaining);
  const debtors = rows
    .filter((r) => r.net < -0.009)
    .map((r) => ({ ...r, remaining: Math.abs(r.net) }))
    .sort((a, b) => b.remaining - a.remaining);

  const out: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]!;
    const c = creditors[j]!;
    const amount = Math.min(d.remaining, c.remaining);
    if (amount > 0.009) {
      out.push({
        fromUserId: d.userId,
        fromName: d.name,
        toUserId: c.userId,
        toName: c.name,
        amount: Math.round(amount * 100) / 100,
      });
    }
    d.remaining -= amount;
    c.remaining -= amount;
    if (d.remaining <= 0.009) i += 1;
    if (c.remaining <= 0.009) j += 1;
  }
  return out;
}
