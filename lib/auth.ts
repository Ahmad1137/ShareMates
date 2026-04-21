import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export async function requireUser(): Promise<AppUser> {
  const supabase = await createClient();
  let user: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; name?: string };
  } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email.split("@")[0] ??
    "User";

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("email_verified")
    .eq("id", user.id)
    .maybeSingle();
  if (!profileError) {
    const verified = Boolean(
      (profile as { email_verified?: boolean } | null)?.email_verified,
    );
    if (!verified) {
      redirect("/verify-email");
    }
  }

  // Avoid a DB upsert on every navigation — that added ~1 round-trip per
  // request and stacked with middleware getUser(). New auth users are inserted
  // via the `on_auth_user_created` trigger on public.users.

  return { id: user.id, email, name };
}
