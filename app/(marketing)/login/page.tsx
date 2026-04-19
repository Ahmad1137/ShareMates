import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function normalizeNext(nextValue: string | undefined): string {
  if (!nextValue || !nextValue.startsWith("/")) {
    return "/dashboard";
  }
  return nextValue;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const nextPath = normalizeNext(sp.next);
  return (
    <div className="relative flex min-h-[calc(100svh-8rem)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 grid-pattern"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/30 via-indigo-400/20 to-fuchsia-400/25 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-[10%] -z-10 size-72 rounded-full bg-gradient-to-br from-fuchsia-400/25 to-violet-500/25 blur-3xl animate-float-slow [animation-delay:1.5s]"
      />

      <div className="w-full max-w-md animate-blur-in">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Sparkles className="size-4" />
            </span>
            <span className="gradient-text text-base font-semibold">
              ShareMates
            </span>
          </Link>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-400/25 via-indigo-300/15 to-fuchsia-300/25 blur-2xl animate-pulse-soft" />
          <div className="rounded-2xl border border-border/60 glass-strong p-8 shadow-card transition-shadow duration-300 hover:shadow-glow">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue to ShareMates
              </p>
            </div>
            <LoginForm nextPath={nextPath} />
          </div>
        </div>
      </div>
    </div>
  );
}
