"use client";

import { acceptInvitation } from "@/app/actions/invitations";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, MailOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  token: string;
  signedInEmail: string | null;
};

export function AcceptInviteCard({ token, signedInEmail }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const next = `/invite/${token}`;

  function onAccept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptInvitation(token);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("groupId" in res) {
        router.push(`/group/${res.groupId}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg animate-fade-up">
      <div className="relative">
        <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/25 via-teal-300/15 to-cyan-300/25 blur-2xl" />
        <div className="rounded-2xl border border-border/60 glass-strong p-8 shadow-card">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <MailOpen className="size-6" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            You&apos;re invited
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You were invited to join a ShareMates group. Accept below to get
            started.
          </p>

          {signedInEmail ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="size-4" />
              </span>
              <div className="text-sm">
                <p className="text-muted-foreground">Signed in as</p>
                <p className="font-medium">{signedInEmail}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Sign in or sign up first, then come back to accept.
            </div>
          )}

          {error ? (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive animate-fade-in">
              {error}
            </p>
          ) : null}

          {signedInEmail ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                disabled={pending}
                onClick={onAccept}
                className="btn-gradient group h-11 border-0 text-white shadow-glow"
              >
                {pending ? (
                  "Accepting…"
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    Accept invitation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => router.push("/dashboard")}
              >
                Go to dashboard
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className={cn(
                  buttonVariants(),
                  "btn-gradient h-11 border-0 text-white shadow-glow",
                )}
              >
                Sign in
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className={cn(buttonVariants({ variant: "outline" }), "h-11")}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
