/** Positive = counterparty owes you; negative = you owe them. */
export function formatDebtBalanceLabel(balance: number): string {
  if (Math.abs(balance) < 0.005) return "Settled up";
  if (balance > 0) return `They owe you ${balance.toFixed(2)}`;
  return `You owe ${Math.abs(balance).toFixed(2)}`;
}
