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

  const { error } = await supabase.from("users").upsert(
    { id: user.id, email, name },
    { onConflict: "id" },
  );

  if (error) {
    console.error("users upsert:", error.message);
  }

  return { id: user.id, email, name };
}
