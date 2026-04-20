import { verifyEmailToken } from "@/app/actions/custom-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type VerifyEmailCallbackPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailCallbackPage({
  searchParams,
}: VerifyEmailCallbackPageProps) {
  const sp = await searchParams;
  const token = String(sp.token ?? "").trim();

  const result = token
    ? await verifyEmailToken(token)
    : ({ ok: false, error: "Missing verification token." } as const);

  return (
    <div className="mx-auto max-w-xl space-y-5 p-6 md:p-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {result.ok ? "Email verified" : "Verification failed"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {result.ok
          ? "Your email is verified. You can continue to your dashboard."
          : result.error ?? "Could not verify your email."}
      </p>
      <div className="flex gap-2">
        <Link href={result.ok ? "/dashboard" : "/verify-email"}>
          <Button className="btn-gradient border-0 text-white">
            {result.ok ? "Open dashboard" : "Try again"}
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Go to login</Button>
        </Link>
      </div>
    </div>
  );
}
