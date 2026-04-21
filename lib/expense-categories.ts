export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Stay",
  "Groceries",
  "Entertainment",
  "Utilities",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function normalizeExpenseCategory(raw: string | undefined): ExpenseCategory {
  const val = (raw ?? "").trim();
  const found = EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === val.toLowerCase());
  return found ?? "Other";
}
