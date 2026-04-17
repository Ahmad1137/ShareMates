"use server";

import { requireUser } from "@/lib/auth";
import { equalSplitAmounts } from "@/lib/splits/equal-split";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpenseWithEqualSplits(input: {
  groupId: string;
  amount: number;
  description: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const description = input.description.trim() || "Expense";
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount greater than zero." };
  }

  const { data: members, error: mErr } = await supabase
    .from("members")
    .select("user_id")
    .eq("group_id", input.groupId);

  if (mErr) {
    return { error: mErr.message };
  }

  const memberIds = [...new Set(members?.map((m) => m.user_id) ?? [])];
  if (memberIds.length === 0) {
    return { error: "Add at least one member before creating an expense." };
  }

  let splits: ReturnType<typeof equalSplitAmounts>;
  try {
    splits = equalSplitAmounts(amount, memberIds);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid split." };
  }

  const { data: expense, error: eErr } = await supabase
    .from("expenses")
    .insert({
      group_id: input.groupId,
      paid_by: user.id,
      amount,
      description,
    })
    .select("id")
    .single();

  if (eErr || !expense) {
    return { error: eErr?.message ?? "Could not save expense." };
  }

  const { error: sErr } = await supabase.from("splits").insert(
    splits.map((s) => ({
      expense_id: expense.id,
      user_id: s.userId,
      amount: s.amount,
    })),
  );

  if (sErr) {
    await supabase.from("expenses").delete().eq("id", expense.id);
    return { error: sErr.message };
  }

  revalidatePath(`/group/${input.groupId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
