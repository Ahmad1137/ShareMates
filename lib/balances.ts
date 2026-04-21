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

export type GroupSettlementRow = {
  sender_id: string;
  receiver_id: string;
  amount: number | string;
};

export type UserBalance = {
  userId: string;
  name: string;
  /** Total amount this person paid across expenses (cash out). */
  paid: number;
  /** Total of this person’s assigned splits (their share of expenses). */
  share: number;
  /** paid − share. Positive ≈ fronted more than your share; negative ≈ owe the group for your share. */
  net: number;
};

/**
 * Per-member balances: paid (cash out) vs share (assigned splits).
 * `net = paid − share`. Sum of all nets is ~0 (floating noise aside).
 */
export function computeGroupBalances(
  expenses: ExpenseRow[],
  splits: SplitRow[],
  userNames: Map<string, string>,
  memberUserIds?: string[],
  settlements?: GroupSettlementRow[],
): UserBalance[] {
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  if (memberUserIds) {
    for (const id of memberUserIds) {
      paid.set(id, 0);
      share.set(id, 0);
    }
  }

  for (const e of expenses) {
    const amt = Number(e.amount);
    paid.set(e.paid_by, (paid.get(e.paid_by) ?? 0) + amt);
  }

  for (const s of splits) {
    const amt = Number(s.amount);
    share.set(s.user_id, (share.get(s.user_id) ?? 0) + amt);
  }

  for (const s of settlements ?? []) {
    const amt = Number(s.amount);
    // Settlement payment reduces sender debt and receiver credit.
    paid.set(s.sender_id, (paid.get(s.sender_id) ?? 0) + amt);
    share.set(s.receiver_id, (share.get(s.receiver_id) ?? 0) + amt);
  }

  const userIds = new Set<string>([
    ...paid.keys(),
    ...share.keys(),
    ...(memberUserIds ?? []),
  ]);

  const rows: UserBalance[] = [];
  for (const userId of userIds) {
    const p = Math.round((paid.get(userId) ?? 0) * 100) / 100;
    const sh = Math.round((share.get(userId) ?? 0) * 100) / 100;
    const net = Math.round((p - sh) * 100) / 100;
    rows.push({
      userId,
      name: userNames.get(userId) ?? userId,
      paid: p,
      share: sh,
      net,
    });
  }

  return rows.sort((a, b) => b.net - a.net);
}
