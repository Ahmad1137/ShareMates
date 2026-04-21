"use server";

import { requireUser } from "@/lib/auth";
import { computeGroupBalances } from "@/lib/balances";
import { fetchExpensesForGroup } from "@/lib/expense-queries";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGroupSettlement(input: {
  groupId: string;
  receiverId: string;
  amount: number;
  note?: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount greater than zero." };
  }
  if (input.receiverId === user.id) {
    return { error: "You cannot settle with yourself." };
  }

  const [{ data: memberRows, error: memberErr }, { data: splitRows, error: splitErr }] =
    await Promise.all([
      supabase
        .from("members")
        .select("user_id, users(id, name)")
        .eq("group_id", input.groupId),
      supabase
        .from("splits")
        .select("expense_id, user_id, amount")
        .in(
          "expense_id",
          (
            await supabase
              .from("expenses")
              .select("id")
              .eq("group_id", input.groupId)
          ).data?.map((e) => e.id) ?? [],
        ),
    ]);
  if (memberErr) return { error: memberErr.message };
  if (splitErr) return { error: splitErr.message };

  const { data: expenses, error: expensesError } = await fetchExpensesForGroup(
    supabase,
    input.groupId,
  );
  if (expensesError) return { error: expensesError.message };
  const { data: settlementRows, error: settlementErr } = await supabase
    .from("group_settlements")
    .select("sender_id, receiver_id, amount")
    .eq("group_id", input.groupId);
  if (settlementErr) return { error: settlementErr.message };

  const names = new Map<string, string>();
  const memberIds: string[] = [];
  for (const m of memberRows ?? []) {
    memberIds.push(m.user_id);
    const u = m.users as { id?: string; name?: string } | Array<{ id?: string; name?: string }> | null;
    const picked = Array.isArray(u) ? u[0] : u;
    if (picked?.id && picked.name) names.set(picked.id, picked.name);
  }

  const balances = computeGroupBalances(
    (expenses ?? []).map((e) => ({ id: e.id, amount: e.amount, paid_by: e.paid_by })),
    (splitRows ?? []).map((s) => ({
      expense_id: s.expense_id,
      user_id: s.user_id,
      amount: s.amount,
    })),
    names,
    memberIds,
    (settlementRows ?? []).map((s) => ({
      sender_id: s.sender_id,
      receiver_id: s.receiver_id,
      amount: s.amount,
    })),
  );
  const meBal = balances.find((b) => b.userId === user.id)?.net ?? 0;
  const receiverBal = balances.find((b) => b.userId === input.receiverId)?.net ?? 0;
  const maxPayable = Math.min(Math.abs(Math.min(meBal, 0)), Math.max(receiverBal, 0));
  if (maxPayable <= 0.009) {
    return { error: "No pending balance to settle with this member." };
  }
  if (amount > maxPayable + 0.0001) {
    return { error: "You cannot pay more than the remaining balance" };
  }

  const { data: receiverMembership, error: receiverErr } = await supabase
    .from("members")
    .select("id")
    .eq("group_id", input.groupId)
    .eq("user_id", input.receiverId)
    .maybeSingle();
  if (receiverErr) return { error: receiverErr.message };
  if (!receiverMembership) return { error: "Receiver is not in this group." };

  const { error } = await supabase.from("group_settlements").insert({
    group_id: input.groupId,
    sender_id: user.id,
    receiver_id: input.receiverId,
    amount,
    note: (input.note ?? "").trim(),
  });
  if (error) return { error: error.message };

  revalidatePath(`/group/${input.groupId}`);
  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
