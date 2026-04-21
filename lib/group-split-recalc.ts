import { equalSplitAmounts } from "@/lib/splits/equal-split";
import type { SupabaseClient } from "@supabase/supabase-js";

type MemberRow = {
  user_id: string;
  included_in_previous?: boolean | null;
  joined_at?: string | null;
};

type ExpenseRow = {
  id: string;
  amount: number | string;
  spent_on?: string | null;
  created_at?: string | null;
};

function expenseTimeMs(e: ExpenseRow): number {
  if (e.spent_on) {
    return new Date(`${e.spent_on}T12:00:00.000Z`).getTime();
  }
  return new Date(e.created_at ?? Date.now()).getTime();
}

export async function recalculateGroupHistoricalSplits(
  supabase: SupabaseClient,
  groupId: string,
) {
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("user_id, included_in_previous, joined_at")
    .eq("group_id", groupId);
  if (membersError) return { error: membersError.message };

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("id, amount, spent_on, created_at")
    .eq("group_id", groupId);
  if (expensesError) return { error: expensesError.message };

  const memberRows = (members ?? []) as MemberRow[];
  const expenseRows = (expenses ?? []) as ExpenseRow[];
  if (expenseRows.length === 0) return { ok: true as const };

  const splitRows: Array<{ expense_id: string; user_id: string; amount: number }> =
    [];
  for (const e of expenseRows) {
    const at = expenseTimeMs(e);
    const eligibleUserIds = memberRows
      .filter((m) => {
        if (m.included_in_previous) return true;
        if (!m.joined_at) return false;
        return new Date(m.joined_at).getTime() <= at;
      })
      .map((m) => m.user_id);
    if (eligibleUserIds.length === 0) continue;

    const splits = equalSplitAmounts(Number(e.amount), eligibleUserIds);
    for (const s of splits) {
      splitRows.push({
        expense_id: e.id,
        user_id: s.userId,
        amount: s.amount,
      });
    }
  }

  const expenseIds = expenseRows.map((e) => e.id);
  const { error: deleteErr } = await supabase
    .from("splits")
    .delete()
    .in("expense_id", expenseIds);
  if (deleteErr) return { error: deleteErr.message };

  if (splitRows.length > 0) {
    const { error: insertErr } = await supabase.from("splits").insert(splitRows);
    if (insertErr) return { error: insertErr.message };
  }

  return { ok: true as const };
}
