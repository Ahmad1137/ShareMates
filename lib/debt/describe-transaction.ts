import type { DebtTransactionRow } from "@/lib/debt/types";

/** One-line summary of a ledger row from the signed-in user's perspective. */
export function describeDebtTransactionForViewer(
  t: DebtTransactionRow,
  viewerId: string,
  nameByUserId: Map<string, string>,
): string {
  const amt = Number(t.amount).toFixed(2);
  const s = nameByUserId.get(t.sender_id) ?? "Someone";
  const r = nameByUserId.get(t.receiver_id) ?? "Someone";

  if (t.type === "lend") {
    if (t.sender_id === viewerId) return `You lent $${amt} to ${r}`;
    return `${s} lent you $${amt}`;
  }
  if (t.type === "borrow") {
    if (t.receiver_id === viewerId) return `You borrowed $${amt} from ${s}`;
    return `${r} borrowed $${amt} from you`;
  }
  if (t.sender_id === viewerId) return `You paid $${amt} to ${r} (settled)`;
  return `${s} paid you $${amt} (settled)`;
}
