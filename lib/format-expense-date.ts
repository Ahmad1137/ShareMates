/** Format calendar date for display; avoids UTC shifting YYYY-MM-DD. */
export function formatExpenseDay(
  spentOn: string | null | undefined,
  createdAt: string | null | undefined,
  compactYear?: boolean,
): string {
  if (spentOn && /^\d{4}-\d{2}-\d{2}$/.test(spentOn)) {
    const [y, m, d] = spentOn.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(compactYear ? {} : { year: "numeric" }),
    });
  }
  if (createdAt) {
    return new Date(createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(compactYear ? {} : { year: "numeric" }),
    });
  }
  return "—";
}
