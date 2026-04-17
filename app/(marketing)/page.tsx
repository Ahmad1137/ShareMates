import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Check,
  Receipt,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShareMates — Split expenses easily",
  description:
    "Share bills with groups, split fairly, and see balances at a glance. Free and simple.",
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-24 pt-16 md:px-6 md:pb-32 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mesh-bg opacity-70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[620px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-300/30 via-teal-300/20 to-cyan-300/20 blur-3xl dark:from-emerald-500/20 dark:via-teal-500/10 dark:to-cyan-500/10"
        />

        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start gap-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Sparkles className="size-3.5" />
              Group expenses, simplified
            </span>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Split expenses,{" "}
              <span className="gradient-text">stay friends.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Create groups, add people, log shared costs, and see who owes
              whom — without a messy spreadsheet.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "btn-gradient group h-12 border-0 px-8 text-base text-white shadow-glow",
                )}
              >
                Get started free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 border-border/70 bg-background/60 px-8 text-base backdrop-blur hover:bg-accent",
                )}
              >
                Sign in
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8">
              {[
                "Equal splits in one tap",
                "Balance charts per group",
                "Free for friends & roommates",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <Check className="size-3" />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating preview card */}
          <div className="mt-16 animate-fade-up [animation-delay:200ms]">
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/30 via-teal-300/20 to-cyan-300/30 blur-2xl" />
              <div className="rounded-2xl border border-border/60 glass-strong p-6 shadow-card">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Weekend in Lisbon</p>
                      <p className="text-xs text-muted-foreground">
                        4 members · 12 expenses
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Balanced
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { name: "Alex", amt: "+$42.50", pos: true },
                    { name: "Sam", amt: "-$18.00", pos: false },
                    { name: "Jordan", amt: "+$7.50", pos: true },
                    { name: "Taylor", amt: "-$32.00", pos: false },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="rounded-xl border border-border/50 bg-card/50 p-3"
                    >
                      <p className="text-xs text-muted-foreground">{p.name}</p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-sm font-semibold tabular-nums",
                          p.pos
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500",
                        )}
                      >
                        {p.amt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Why ShareMates
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to stay fair
            </h2>
            <p className="mt-4 text-muted-foreground">
              Focused tools that do one thing well — and get out of your way.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Group expenses",
                body: "Trip, apartment, or dinner club — keep every shared cost in one place.",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: Receipt,
                title: "Split bills",
                body: "Record who paid and split totals equally across members automatically.",
                color: "from-teal-500 to-cyan-600",
              },
              {
                icon: BarChart3,
                title: "Track balances",
                body: "See who's up or down in each group with clear, visual summaries.",
                color: "from-cyan-500 to-blue-600",
              },
            ].map(({ icon: Icon, title, body, color }, i) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur hover-lift animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow transition-transform group-hover:scale-110",
                    color,
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Fast",
                body: "Log an expense in seconds.",
              },
              {
                icon: Shield,
                title: "Private",
                body: "Row-Level Security by default.",
              },
              {
                icon: Sparkles,
                title: "Simple",
                body: "No training required.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/40 p-5 backdrop-blur"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/features"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "bg-accent/60 backdrop-blur hover:bg-accent",
              )}
            >
              Explore all features
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 p-10 shadow-card md:p-16">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br from-emerald-400/40 to-teal-500/30 blur-3xl"
            />
            <div className="relative">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Ready to split smarter?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Create your first group in under a minute. Free, forever.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "btn-gradient group h-12 border-0 px-8 text-base text-white shadow-glow",
                  )}
                >
                  Start for free
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/features"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 border-border/70 bg-background/60 px-8 text-base backdrop-blur",
                  )}
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
