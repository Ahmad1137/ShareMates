import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Check,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  Sparkles,
  Star,
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

const stats = [
  { label: "Groups created", value: "12k+" },
  { label: "Split accuracy", value: "100%" },
  { label: "Avg. log time", value: "4s" },
  { label: "Happy users", value: "4.9★" },
];

const steps = [
  {
    n: "01",
    title: "Create a group",
    body: "Start a trip, apartment, or dinner club in seconds. Invite friends with one link.",
    icon: Users,
  },
  {
    n: "02",
    title: "Log expenses",
    body: "Drop in what you paid. ShareMates splits evenly (or custom) across the group.",
    icon: Receipt,
  },
  {
    n: "03",
    title: "Settle up",
    body: "See who owes whom at a glance. Mark payments as settled and move on.",
    icon: PiggyBank,
  },
];

const testimonials = [
  {
    name: "Maya R.",
    role: "Lisbon roomie",
    quote:
      "We replaced a Google Sheet and two group chats with ShareMates. Rent, groceries, Uber — all balanced in one place.",
  },
  {
    name: "Diego P.",
    role: "Weekend traveler",
    quote:
      "Logged every ramen, train ticket, and hotel split from Tokyo. Nobody had to do mental math at the airport.",
  },
  {
    name: "Priya K.",
    role: "Dinner-club organizer",
    quote:
      "The balance chart is chef's kiss. I finally know who's been quietly overpaying for three months.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-24 pt-16 md:px-6 md:pb-32 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 grid-pattern"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mesh-bg opacity-80"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/30 via-indigo-400/20 to-fuchsia-300/25 blur-3xl animate-float-slow dark:from-violet-500/25 dark:via-indigo-500/15 dark:to-fuchsia-500/15"
        />

        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start gap-6 animate-blur-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-700 shadow-sm backdrop-blur dark:text-violet-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
              </span>
              New · Smart split suggestions
              <Sparkles className="size-3.5" />
            </span>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Split expenses,{" "}
              <span className="gradient-text">stay friends.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Create groups, add people, log shared costs, and see who owes
              whom — without a messy spreadsheet.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 animate-fade-up [animation-delay:150ms]">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "btn-gradient group h-12 border-0 px-8 text-base text-white shadow-glow",
                )}
              >
                Get started free
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 border-border/70 bg-background/60 px-8 text-base backdrop-blur hover:bg-accent hover:-translate-y-0.5",
                )}
              >
                Sign in
              </Link>
            </div>

            <ul className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8 animate-fade-up [animation-delay:300ms]">
              {[
                "Equal splits in one tap",
                "Balance charts per group",
                "Free for friends & roommates",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300">
                    <Check className="size-3" />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating preview card */}
          <div className="mt-16 animate-fade-up [animation-delay:400ms]">
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-400/30 via-indigo-400/20 to-fuchsia-400/30 blur-3xl animate-pulse-soft" />
              <div className="rounded-2xl border border-border/60 glass-strong p-6 shadow-card hover-lift">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow">
                      <Plane className="size-5" />
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
                  ].map((p, i) => (
                    <div
                      key={p.name}
                      className="group rounded-xl border border-border/50 bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-glow animate-fade-up"
                      style={{ animationDelay: `${500 + i * 80}ms` }}
                    >
                      <p className="text-xs text-muted-foreground">{p.name}</p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-sm font-semibold tabular-nums transition-colors",
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

      {/* STATS */}
      <section className="px-4 md:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-card backdrop-blur md:grid-cols-4 md:p-8">
            {stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 80}
                className="flex flex-col items-center text-center"
              >
                <p className="text-3xl font-bold tracking-tight gradient-text md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section className="relative px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Why ShareMates
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to stay fair
            </h2>
            <p className="mt-4 text-muted-foreground">
              Focused tools that do one thing well — and get out of your way.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Group expenses",
                body: "Trip, apartment, or dinner club — keep every shared cost in one place.",
                color: "from-violet-500 to-indigo-600",
              },
              {
                icon: Receipt,
                title: "Split bills",
                body: "Record who paid and split totals equally across members automatically.",
                color: "from-indigo-500 to-blue-600",
              },
              {
                icon: BarChart3,
                title: "Track balances",
                body: "See who's up or down in each group with clear, visual summaries.",
                color: "from-fuchsia-500 to-violet-600",
              },
            ].map(({ icon: Icon, title, body, color }, i) => (
              <Reveal
                key={title}
                delay={i * 120}
                className="group relative rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur hover-lift"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 via-transparent to-fuchsia-500/0 opacity-0 transition-opacity duration-500 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 group-hover:opacity-100"
                />
                <div
                  className={cn(
                    "relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    color,
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </Reveal>
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
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 100}
                className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/40 p-5 backdrop-blur transition-all hover:border-violet-500/40 hover:shadow-glow"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 text-center">
            <Link
              href="/features"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "group bg-accent/60 backdrop-blur hover:bg-accent",
              )}
            >
              Explore all features
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative px-4 py-20 md:px-6 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-violet-500/5 to-transparent"
        />
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              From chaos to clarity in three steps
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 140}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur hover-lift"
              >
                <span className="absolute right-5 top-5 font-mono text-5xl font-bold text-muted-foreground/15 transition-colors duration-500 group-hover:text-violet-500/30">
                  {s.n}
                </span>
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
              Loved by roomies & travelers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Real groups. Fair splits.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 120}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur hover-lift"
              >
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white shadow-glow">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 md:px-6">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-fuchsia-500/15 p-10 shadow-card md:p-16">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-500/30 blur-3xl animate-float-slow"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -left-20 size-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-500/30 blur-3xl animate-float-slow [animation-delay:2s]"
            />
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow">
                <Wallet className="size-5" />
              </div>
              <h2 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
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
                    "h-12 border-border/70 bg-background/60 px-8 text-base backdrop-blur hover:-translate-y-0.5",
                  )}
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
