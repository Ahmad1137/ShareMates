"use server";

import { requireUser } from "@/lib/auth";
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
