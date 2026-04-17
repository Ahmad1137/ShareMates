import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account",
};

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function normalizeNext(nextValue: string | undefined): string {
  if (!nextValue || !nextValue.startsWith("/")) {
    return "/dashboard";
  }
  return nextValue;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const sp = await searchParams;
  const nextPath = normalizeNext(sp.next);
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-cyan-400/20 blur-3xl"
      />
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow transition-transform group-hover:scale-105">
              <Sparkles className="size-4" />
            </span>
            <span className="gradient-text text-base font-semibold">
              ShareMates
            </span>
          </Link>
        </div>
        <div className="relative">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-cyan-300/20 blur-xl" />
          <div className="rounded-2xl border border-border/60 glass-strong p-8 shadow-card">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Free forever. No credit card required.
              </p>
            </div>
            <SignupForm nextPath={nextPath} />
          </div>
        </div>
      </div>
    </div>
  );
}
