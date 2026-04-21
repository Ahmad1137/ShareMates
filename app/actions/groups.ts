"use server";

import { requireUser } from "@/lib/auth";
import { sendGroupAddedEmail } from "@/lib/email/send-group-added-email";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { recalculateGroupHistoricalSplits } from "@/lib/group-split-recalc";
import { getPublicSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGroup(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Group name is required." };
  }

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("users")
    .upsert(
      { id: user.id, email: user.email, name: user.name },
      { onConflict: "id" },
    );
  if (profileError) {
    return { error: profileError.message };
  }

  const { data: groupId, error } = await supabase.rpc(
    "create_group_with_owner",
    { p_name: name },
  );

  if (error || !groupId) {
    return {
      error:
        error?.message ??
        "Could not create group. Run db/008_create_group_with_owner_rpc.sql in Supabase SQL Editor.",
    };
  }

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  revalidatePath(`/group/${groupId}`);
  redirect(`/group/${groupId}`);
}

export async function addMemberByEmail(
  groupId: string,
  email: string,
  includeInPrevious = false,
) {
  const user = await requireUser();
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const { data: target, error: findError } = await supabase
    .from("users")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  if (findError) {
    return { error: findError.message };
  }
  if (target) {
    let addResult: string | null = null;
    let error: { message?: string } | null = null;
    const rpcNew = await supabase.rpc("add_member_to_group", {
      p_group_id: groupId,
      p_user_id: target.id,
      p_include_in_previous: includeInPrevious,
    });
    if (rpcNew.error && rpcNew.error.message.includes("function")) {
      const rpcOld = await supabase.rpc("add_member_to_group", {
        p_group_id: groupId,
        p_user_id: target.id,
      });
      addResult = rpcOld.data as string | null;
      error = rpcOld.error;
    } else {
      addResult = rpcNew.data as string | null;
      error = rpcNew.error;
    }

    if (error) {
      const message = error.message ?? "Could not add member.";
      if (message.includes("forbidden")) {
        return {
          error: "You don't have permission to add members to this group.",
        };
      }
      return {
        error: `${message} Run db/015_add_member_rpc.sql in Supabase SQL Editor if this persists.`,
      };
    }
    if (addResult === "already") {
      return { error: "That person is already in this group." };
    }

    if (includeInPrevious) {
      const recalc = await recalculateGroupHistoricalSplits(supabase, groupId);
      if ("error" in recalc && recalc.error) {
        return { error: recalc.error };
      }
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .maybeSingle();
    if (groupError || !group) {
      return { error: groupError?.message ?? "Group not found." };
    }

    const groupUrl = `${getPublicSiteOrigin()}/group/${groupId}`;
    const emailResult = await sendGroupAddedEmail({
      to: normalized,
      groupName: group.name,
      groupUrl,
    });

    revalidatePath(`/group/${groupId}`);
    revalidatePath("/groups");
    revalidatePath("/dashboard");
    return {
      ok: true as const,
      mode: "added" as const,
      email: normalized,
      emailSent: emailResult.sent,
      emailReason: emailResult.reason,
    };
  }

  // Not registered yet: create or reuse a pending invitation.
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .maybeSingle();
  if (groupError || !group) {
    return { error: groupError?.message ?? "Group not found." };
  }

  const { data: existingInvite, error: inviteFindError } = await supabase
    .from("invitations")
    .select("token")
    .eq("group_id", groupId)
    .eq("email", normalized)
    .eq("status", "pending")
    .maybeSingle();

  if (inviteFindError) {
    return { error: inviteFindError.message };
  }

  let inviteToken = existingInvite?.token ?? null;
  if (!inviteToken) {
    inviteToken = crypto.randomUUID();
    let inviteCreateError: { message?: string } | null = null;
    const inviteCreate = await supabase
      .from("invitations")
      .insert({
        group_id: groupId,
        invited_by: user.id,
        email: normalized,
        token: inviteToken,
        status: "pending",
        include_in_previous: includeInPrevious,
      });
    inviteCreateError = inviteCreate.error;
    if (inviteCreateError && inviteCreateError.message?.includes("include_in_previous")) {
      const fallbackInviteCreate = await supabase
        .from("invitations")
        .insert({
          group_id: groupId,
          invited_by: user.id,
          email: normalized,
          token: inviteToken,
          status: "pending",
        });
      inviteCreateError = fallbackInviteCreate.error;
    }
    if (inviteCreateError) {
      return { error: inviteCreateError.message };
    }
  }

  revalidatePath(`/group/${groupId}`);
  const inviteUrl = `${getPublicSiteOrigin()}/invite/${inviteToken}`;
  const emailResult = await sendInviteEmail({
    to: normalized,
    groupName: group.name,
    inviteUrl,
  });
  return {
    ok: true as const,
    mode: "invited" as const,
    inviteToken,
    email: normalized,
    inviteUrl,
    emailSent: emailResult.sent,
    emailReason: emailResult.reason,
  };
}

export async function deleteGroup(groupId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) {
    return { error: groupError.message };
  }
  if (!group) {
    return { error: "Group not found." };
  }
  if (group.created_by !== user.id) {
    return { error: "Only the group creator can delete this group." };
  }

  const { error: deleteError } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
