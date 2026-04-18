"use server";

import { requireUser } from "@/lib/auth";
import { equalSplitAmounts } from "@/lib/splits/equal-split";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function normalizeSpentOn(raw: string | undefined): string {
  const s = (raw ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (
      dt.getFullYear() === y &&
      dt.getMonth() === m - 1 &&
      dt.getDate() === d
    ) {
      return s;
    }
  }
  return new Date().toISOString().slice(0, 10);
}

export async function createExpenseWithEqualSplits(input: {
  groupId: string;
  amount: number;
  description: string;
  spentOn?: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const description = input.description.trim() || "Expense";
  const amount = Number(input.amount);
  const spentOn = normalizeSpentOn(input.spentOn);
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

   const insertPayload = {
    group_id: input.groupId,
    paid_by: user.id,
    amount,
    description,
    spent_on: spentOn,
  };

  let expenseResult = await supabase
    .from("expenses")
    .insert(insertPayload)
    .select("id")
    .single();

  const msg = expenseResult.error?.message ?? "";
  const spentOnUnavailable =
    msg.includes("spent_on") &&
    (msg.includes("schema cache") ||
      msg.includes("does not exist") ||
      msg.includes("Could not find"));

  if (spentOnUnavailable) {
    const { group_id, paid_by, amount: amt, description: desc } = insertPayload;
    expenseResult = await supabase
      .from("expenses")
      .insert({
        group_id,
        paid_by,
        amount: amt,
        description: desc,
      })
      .select("id")
      .single();
  }

  const expense = expenseResult.data;
  const eErr = expenseResult.error;

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

  const groupPath = `/group/${input.groupId}`;
  revalidatePath(groupPath, "page");
  revalidatePath(groupPath, "layout");
  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
