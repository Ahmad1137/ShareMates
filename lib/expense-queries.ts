import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingColumn(message: string, col: string): boolean {
  return (
    message.includes(col) &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

/** Group detail: list expenses for one group, newest by spent_on then created_at. */
export async function fetchExpensesForGroup(
  supabase: SupabaseClient,
  groupId: string,
) {
  const full = await supabase
    .from("expenses")
    .select("id, amount, description, spent_on, created_at, paid_by")
    .eq("group_id", groupId)
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (!full.error) {
    return {
      data: full.data ?? [],
      error: null as null,
    };
  }

  if (isMissingColumn(full.error.message ?? "", "spent_on")) {
    const noSpent = await supabase
      .from("expenses")
      .select("id, amount, description, created_at, paid_by")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (!noSpent.error) {
      const rows = (noSpent.data ?? []).map((r) => ({
        ...r,
        spent_on: null as string | null,
      }));
      return { data: rows, error: null as null };
    }

    if (isMissingColumn(noSpent.error.message ?? "", "created_at")) {
      const minimal = await supabase
        .from("expenses")
        .select("id, amount, description, paid_by")
        .eq("group_id", groupId)
        .order("id", { ascending: false });

      if (minimal.error) {
        return { data: [], error: minimal.error };
      }
      const rows = (minimal.data ?? []).map((r) => ({
        ...r,
        spent_on: null as string | null,
        created_at: null as string | null,
      }));
      return { data: rows, error: null as null };
    }

    return { data: [], error: noSpent.error };
  }

  if (isMissingColumn(full.error.message ?? "", "created_at")) {
    const partial = await supabase
      .from("expenses")
      .select("id, amount, description, spent_on, paid_by")
      .eq("group_id", groupId)
      .order("spent_on", { ascending: false })
      .order("id", { ascending: false });

    if (partial.error) {
      return { data: [], error: partial.error };
    }
    const rows = (partial.data ?? []).map((r) => ({
      ...r,
      created_at: null as string | null,
    }));
    return { data: rows, error: null as null };
  }

  return { data: [], error: full.error };
}

/** Dashboard: recent expenses across groups (limit). */
export async function fetchRecentExpensesForGroups(
  supabase: SupabaseClient,
  groupIds: string[],
  limit: number,
) {
  if (groupIds.length === 0) {
    return { data: [], error: null as null };
  }

  const full = await supabase
    .from("expenses")
    .select(
      "id, amount, description, spent_on, created_at, group_id, paid_by, groups(name)",
    )
    .in("group_id", groupIds)
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!full.error) {
    return {
      data: full.data ?? [],
      error: null as null,
    };
  }

  if (isMissingColumn(full.error.message ?? "", "spent_on")) {
    const noSpent = await supabase
      .from("expenses")
      .select(
        "id, amount, description, created_at, group_id, paid_by, groups(name)",
      )
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!noSpent.error) {
      const rows = (noSpent.data ?? []).map((r) => ({
        ...r,
        spent_on: null as string | null,
      }));
      return { data: rows, error: null as null };
    }

    if (isMissingColumn(noSpent.error.message ?? "", "created_at")) {
      const minimal = await supabase
        .from("expenses")
        .select("id, amount, description, group_id, paid_by, groups(name)")
        .in("group_id", groupIds)
        .order("id", { ascending: false })
        .limit(limit);

      if (minimal.error) {
        return { data: [], error: minimal.error };
      }
      const rows = (minimal.data ?? []).map((r) => ({
        ...r,
        spent_on: null as string | null,
        created_at: null as string | null,
      }));
      return { data: rows, error: null as null };
    }

    return { data: [], error: noSpent.error };
  }

  return { data: [], error: full.error };
}
