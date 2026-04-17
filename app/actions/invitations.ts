"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptInvitation(token: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: invite, error: inviteError } = await supabase
    .from("invitations")
    .select("id, group_id, email, status")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) {
    return { error: inviteError.message };
  }
  if (!invite) {
    return { error: "Invitation not found." };
  }
  if (invite.status !== "pending") {
    return { error: "This invitation is no longer pending." };
  }
  if ((invite.email ?? "").toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      error:
        "This invitation belongs to a different email. Sign in with the invited email.",
    };
  }

  const { error: memberError } = await supabase.from("members").insert({
    group_id: invite.group_id,
    user_id: user.id,
  });

  if (memberError && memberError.code !== "23505") {
    return { error: memberError.message };
  }

  const { error: updateError } = await supabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/group/${invite.group_id}`);
  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { ok: true as const, groupId: invite.group_id };
}
