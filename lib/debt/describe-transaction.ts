import type { DebtTransactionRow } from "@/lib/debt/types";

/** One-line summary of a ledger row from the signed-in user's perspective. */
export function describeDebtTransactionForViewer(
  t: DebtTransactionRow,
  viewerId: string,
  nameByUserId: Map<string, string>,
  counterpartyLabel: string,
): string {
  const amt = Number(t.amount).toFixed(2);
  const cp = counterpartyLabel;
  const s =
    t.sender_id != null
      ? (nameByUserId.get(t.sender_id) ?? "Someone")
      : counterpartyLabel;
  const r =
    t.receiver_id != null
      ? (nameByUserId.get(t.receiver_id) ?? "Someone")
      : counterpartyLabel;

  if (t.type === "lend") {
    if (t.sender_id === viewerId)
      return t.receiver_id == null
        ? `You lent $${amt} to ${cp}`
        : `You lent $${amt} to ${r}`;
    return `${s} lent you $${amt}`;
  }
  if (t.type === "borrow") {
    if (t.receiver_id === viewerId)
      return t.sender_id == null
        ? `You borrowed $${amt} from ${cp}`
        : `You borrowed $${amt} from ${s}`;
    return `${r} borrowed $${amt} from you`;
  }
  if (t.sender_id === viewerId)
    return t.receiver_id == null
      ? `You paid $${amt} to ${cp} (settled)`
      : `You paid $${amt} to ${r} (settled)`;
  return t.sender_id == null
    ? `${cp} paid you $${amt} (settled)`
    : `${s} paid you $${amt} (settled)`;
}
