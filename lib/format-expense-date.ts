/** Extract YYYY-MM-DD from PostgREST (date / timestamptz / odd JSON shapes). */
export function coerceExpenseDayString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }
  if (typeof value === "object" && value !== null && "value" in value) {
    const inner = (value as { value: unknown }).value;
    if (typeof inner === "string") {
      const m = inner.trim().match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : null;
    }
  }
  return null;
}

/** Format calendar day for display; avoids UTC shifting bare dates. */
export function formatExpenseDay(
  spentOnRaw: unknown,
  createdAtRaw: unknown,
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

  let createdAt: string | null =
    typeof createdAtRaw === "string" ? createdAtRaw : null;
  if (
    !createdAt &&
    typeof createdAtRaw === "object" &&
    createdAtRaw !== null &&
    "value" in createdAtRaw &&
    typeof (createdAtRaw as { value: unknown }).value === "string"
  ) {
    createdAt = (createdAtRaw as { value: string }).value;
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
