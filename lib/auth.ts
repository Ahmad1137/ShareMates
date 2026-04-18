import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export async function requireUser(): Promise<AppUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email.split("@")[0] ??
    "User";

  // Avoid a DB upsert on every navigation — that added ~1 round-trip per
  // request and stacked with middleware getUser(). New auth users are inserted
  // via the `on_auth_user_created` trigger on public.users.

  return { id: user.id, email, name };
}
