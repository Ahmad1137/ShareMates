"use server";

import { requireUser } from "@/lib/auth";
import { recalculateGroupHistoricalSplits } from "@/lib/group-split-recalc";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptInvitation(token: string) {
  await requireUser();
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("invitations")
    .select("group_id, include_in_previous")
    .eq("token", token)
    .maybeSingle();

  const { data: groupId, error } = await supabase.rpc("accept_invitation_member", {
    p_token: token,
  });
  if (error || !groupId) {
    const message = error?.message ?? "Could not accept invitation.";
    if (message.includes("different email")) {
      return {
        error:
          "This invitation belongs to a different email. Sign in with the invited email.",
      };
    }
    if (message.includes("no longer pending")) {
      return { error: "This invitation is no longer pending." };
    }
    if (message.includes("not found")) {
      return { error: "Invitation not found." };
    }
    return {
      error:
        `${message} Run db/014_accept_invitation_rpc.sql in Supabase SQL Editor if this persists.`,
    };
  }

  if ((invite as { include_in_previous?: boolean } | null)?.include_in_previous) {
    const recalc = await recalculateGroupHistoricalSplits(supabase, groupId);
    if ("error" in recalc && recalc.error) {
      return { error: recalc.error };
    }
  }

  revalidatePath(`/group/${groupId}`);
  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { ok: true as const, groupId };
}
