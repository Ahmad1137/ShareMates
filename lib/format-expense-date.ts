/** Extract YYYY-MM-DD from PostgREST (date or timestamptz string). */
export function coerceExpenseDayString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** Format calendar day for display; avoids UTC shifting bare dates. */
export function formatExpenseDay(
  spentOnRaw: unknown,
  createdAt: string | null | undefined,
  compactYear?: boolean,
): string {
  const spentOn = coerceExpenseDayString(spentOnRaw);
  if (spentOn) {
    const [y, m, d] = spentOn.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(compactYear ? {} : { year: "numeric" }),
    });
  }

  if (createdAt) {
    const dt = new Date(createdAt);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...(compactYear ? {} : { year: "numeric" }),
      });
    }
  }
  return "—";
}
