import { sendOwnVerificationEmail } from "@/app/actions/custom-auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("email_verified")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { email_verified?: boolean } | null)?.email_verified) {
    redirect("/dashboard");
  }

  async function resend() {
    "use server";
    await sendOwnVerificationEmail();
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 p-6 md:p-10">
      <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent a verification link to <strong>{user.email}</strong>. Open your inbox and
        click the link to continue.
      </p>
      <form action={resend}>
        <Button type="submit" className="btn-gradient border-0 text-white">
          Resend verification email
        </Button>
      </form>
      <Link href="/login" className="text-sm text-muted-foreground underline">
        Back to login
      </Link>
    </div>
  );
}
