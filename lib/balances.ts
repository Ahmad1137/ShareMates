export type ExpenseRow = {
  id: string;
  amount: number | string;
  paid_by: string;
};

export type SplitRow = {
  expense_id: string;
  user_id: string;
  amount: number | string;
};

export type UserBalance = {
  userId: string;
  name: string;
  /** Positive: others owe you net; negative: you owe net (Splitwise-style net lend). */
  net: number;
};

/**
 * Net balance per user: (cash paid out) minus (share owed on expenses).
 * Sum of all nets is ~0 (floating noise aside).
 */
export function computeGroupBalances(
  expenses: ExpenseRow[],
  splits: SplitRow[],
  userNames: Map<string, string>,
  memberUserIds?: string[],
): UserBalance[] {
  const net = new Map<string, number>();
  if (memberUserIds) {
    for (const id of memberUserIds) {
      net.set(id, 0);
    }
  }

  for (const e of expenses) {
    const amt = Number(e.amount);
    net.set(e.paid_by, (net.get(e.paid_by) ?? 0) + amt);
  }

  for (const s of splits) {
    const amt = Number(s.amount);
    net.set(s.user_id, (net.get(s.user_id) ?? 0) - amt);
  }

  const rows: UserBalance[] = [];
  for (const [userId, value] of net) {
    rows.push({
      userId,
      name: userNames.get(userId) ?? userId,
      net: Math.round(value * 100) / 100,
    });
  }

  return rows.sort((a, b) => b.net - a.net);
}
