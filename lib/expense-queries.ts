import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingCreatedAtColumn(message: string): boolean {
  return (
    message.includes("created_at") &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

/** Group detail: list expenses for one group, newest first when created_at exists. */
export async function fetchExpensesForGroup(
  supabase: SupabaseClient,
  groupId: string,
) {
  const primary = await supabase
    .from("expenses")
    .select("id, amount, description, created_at, paid_by")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (!primary.error) {
    return {
      data: primary.data ?? [],
      error: null as null,
    };
  }

  if (!isMissingCreatedAtColumn(primary.error.message ?? "")) {
    return { data: [], error: primary.error };
  }

  const fallback = await supabase
    .from("expenses")
    .select("id, amount, description, paid_by")
    .eq("group_id", groupId)
    .order("id", { ascending: false });

  if (fallback.error) {
    return { data: [], error: fallback.error };
  }

  const rows = (fallback.data ?? []).map((r) => ({
    ...r,
    created_at: null as string | null,
  }));

  return { data: rows, error: null as null };
}

/** Dashboard: recent expenses across groups (limit), ordered by date when possible. */
export async function fetchRecentExpensesForGroups(
  supabase: SupabaseClient,
  groupIds: string[],
  limit: number,
) {
  if (groupIds.length === 0) {
    return { data: [], error: null as null };
  }

  const primary = await supabase
    .from("expenses")
    .select(
      "id, amount, description, created_at, group_id, paid_by, groups(name)",
    )
    .in("group_id", groupIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!primary.error) {
    return {
      data: primary.data ?? [],
      error: null as null,
    };
  }

  if (!isMissingCreatedAtColumn(primary.error.message ?? "")) {
    return { data: [], error: primary.error };
  }

  const fallback = await supabase
    .from("expenses")
    .select("id, amount, description, group_id, paid_by, groups(name)")
    .in("group_id", groupIds)
    .order("id", { ascending: false })
    .limit(limit);

  if (fallback.error) {
    return { data: [], error: fallback.error };
  }

  const rows = (fallback.data ?? []).map((r) => ({
    ...r,
    created_at: null as string | null,
  }));

  return { data: rows, error: null as null };
}
