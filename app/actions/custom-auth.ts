"use server";

import { randomUUID } from "crypto";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "User email not available." };
  const fallbackName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    email.split("@")[0] ||
    "User";

  const { error: userUpsertError } = await supabase.from("users").upsert(
    { id: user.id, email, name: fallbackName, email_verified: false },
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
  try {
    const supabase = await createClient();

    const trimmed = token.trim();
    if (!trimmed) return { ok: false, error: "Invalid verification token." };

    const { error } = await supabase.rpc("verify_email_with_token", {
      p_token: trimmed,
    });
    if (error) {
      const message = (error.message ?? "").toLowerCase();
      if (message.includes("invalid token")) {
        return { ok: false, error: "Verification link is invalid." };
      }
      if (message.includes("expired token")) {
        return { ok: false, error: "Verification link has expired." };
      }
      if (message.includes("missing token")) {
        return { ok: false, error: "Missing verification token." };
      }
      return {
        ok: false,
        error:
          (error.message ?? "Verification failed.") +
          " Run db/018_verify_email_with_token_rpc.sql in Supabase SQL Editor if this persists.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}
