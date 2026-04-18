import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Mail, User } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-8">
      <div className="animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Your <span className="gradient-text">profile</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account details from your sign-in. Name and email sync to your group
          directory.
        </p>
      </div>

      {/* Avatar card */}
      <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:80ms]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/20 blur-3xl"
        />
        <CardContent className="relative flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-glow">
            {initials}
          </span>
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:160ms]">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Managed through Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <User className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Display name
              </p>
              <p className="mt-0.5 text-base font-medium">{user.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-400">
              <Mail className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="mt-0.5 break-all font-mono text-sm">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400">
              <ExternalLink className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                User ID
              </p>
              <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Marketing site
        </Link>
      </div>
    </div>
  );
}
