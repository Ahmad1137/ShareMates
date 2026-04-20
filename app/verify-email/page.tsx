import { sendOwnVerificationEmail } from "@/app/actions/custom-auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type VerifyEmailPageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const sp = await searchParams;
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
    const { redirect } = await import("next/navigation");
    const res = await sendOwnVerificationEmail();
    if (res.ok) {
      redirect("/verify-email?sent=1");
    }
    redirect(
      `/verify-email?error=${encodeURIComponent(
        res.error ?? "Could not send verification email.",
      )}`,
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 p-6 md:p-10">
      <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
      {sp.sent === "1" ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          Verification email sent successfully.
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sp.error}
        </p>
      ) : null}
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
