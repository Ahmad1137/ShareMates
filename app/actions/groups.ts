"use server";

import { requireUser } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
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

  const { error: profileError } = await supabase.from("users").upsert(
    { id: user.id, email: user.email, name: user.name },
    { onConflict: "id" },
  );
  if (profileError) {
    return { error: profileError.message };
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();

  if (error || !group) {
    return { error: error?.message ?? "Could not create group." };
  }

  const { error: memberError } = await supabase.from("members").insert({
    group_id: group.id,
    user_id: user.id,
  });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  revalidatePath(`/group/${group.id}`);
  redirect(`/group/${group.id}`);
}

export async function addMemberByEmail(groupId: string, email: string) {
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
    const { error } = await supabase.from("members").insert({
      group_id: groupId,
      user_id: target.id,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: "That person is already in this group." };
      }
      return { error: error.message };
    }

    revalidatePath(`/group/${groupId}`);
    revalidatePath("/groups");
    revalidatePath("/dashboard");
    return { ok: true as const, mode: "added" as const };
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
    const { error: inviteCreateError } = await supabase.from("invitations").insert({
      group_id: groupId,
      invited_by: user.id,
      email: normalized,
      token: inviteToken,
      status: "pending",
    });
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
