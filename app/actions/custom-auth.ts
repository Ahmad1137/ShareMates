"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { getPublicSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function buildVerificationUrl(token: string) {
  const origin = getPublicSiteOrigin();
  return `${origin}/auth/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendOwnVerificationEmail(): Promise<{
  ok: boolean;
  error?: string;
  message?: string;
}> {
  const user = await requireUser();
  const supabase = await createClient();

  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "User email not available." };

  const { error: userUpsertError } = await supabase.from("users").upsert(
    { id: user.id, email, name: user.name, email_verified: false },
    { onConflict: "id" },
  );
  if (userUpsertError) return { ok: false, error: userUpsertError.message };

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  const { error: deleteOldError } = await supabase
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", user.id);
  if (deleteOldError) return { ok: false, error: deleteOldError.message };

  const { error: tokenInsertError } = await supabase
    .from("email_verification_tokens")
    .insert({
      user_id: user.id,
      email,
      token,
      expires_at: expiresAt,
    });
  if (tokenInsertError) return { ok: false, error: tokenInsertError.message };

  const emailRes = await sendVerificationEmail({
    to: email,
    verificationUrl: buildVerificationUrl(token),
  });
  if (!emailRes.sent) {
    return { ok: false, error: emailRes.reason ?? "Could not send verification email." };
  }

  return { ok: true, message: "Verification email sent." };
}

export async function verifyEmailToken(token: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await requireUser();
  const supabase = await createClient();
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Invalid verification token." };

  const { data: row, error: tokenError } = await supabase
    .from("email_verification_tokens")
    .select("id, user_id, expires_at")
    .eq("token", trimmed)
    .maybeSingle();
  if (tokenError) return { ok: false, error: tokenError.message };
  if (!row) return { ok: false, error: "Verification link is invalid." };
  if (row.user_id !== user.id) {
    return { ok: false, error: "This verification link belongs to another account." };
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Verification link has expired." };
  }

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({ email_verified: true })
    .eq("id", user.id);
  if (userUpdateError) return { ok: false, error: userUpdateError.message };

  const { error: cleanupError } = await supabase
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", user.id);
  if (cleanupError) return { ok: false, error: cleanupError.message };

  revalidatePath("/dashboard");
  revalidatePath("/groups");
  return { ok: true };
}
