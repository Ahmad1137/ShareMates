/**
 * Split `total` equally across `memberUserIds` in whole cents.
 * Remaining cents go to the first users in list order (largest-remainder style).
 */
export function equalSplitAmounts(
  total: number,
  memberUserIds: string[],
): { userId: string; amount: number }[] {
  if (memberUserIds.length === 0) {
    throw new Error("Need at least one member to split an expense.");
  }
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const totalCents = Math.round(total * 100);
  const n = memberUserIds.length;
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;

  return memberUserIds.map((userId, index) => {
    const cents = base + (index < remainder ? 1 : 0);
    return { userId, amount: cents / 100 };
  });
}
