import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "ShareMates is free to use.",
};

export default function PricingPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-3.5" />
            One simple plan
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            We're keeping ShareMates simple: one plan, no credit card required
            to start.
          </p>
        </div>

        <div className="relative mt-12 animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/30 via-teal-300/20 to-cyan-300/30 blur-2xl" />
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card/80 to-card p-8 shadow-card backdrop-blur md:p-12">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Free forever
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">$0</span>
                  <span className="text-muted-foreground">/ month</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlimited groups and expenses on the current version.
                </p>
              </div>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "btn-gradient group h-12 w-full border-0 px-8 text-white shadow-glow sm:w-auto",
                )}
              >
                Get started
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-3 border-t border-border/60 pt-8 text-sm sm:grid-cols-2">
              {[
                "Unlimited groups and members",
                "Equal expense splits",
                "Balance summaries per group",
                "Email sign-in with magic links",
                "Invite by email (automatic)",
                "Row-Level Security built-in",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <Check className="size-3" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Paid tiers may be introduced later for teams or advanced features. If
          that happens, we'll announce it here and in the app with plenty of
          notice.
        </p>
      </div>
    </div>
  );
}
