import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Heart, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why ShareMates exists and what we're building.",
};

export default function AboutPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Our story
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            About <span className="gradient-text">ShareMates</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
            ShareMates helps friends, roommates, and travel groups track shared
            spending without the awkward &quot;who owes who?&quot; math.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 animate-fade-up [animation-delay:120ms]">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <Target className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">What we do</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You create a group, invite people by email, and add expenses as
              they happen. We split amounts fairly, show balances per person,
              and keep a clear history so everyone stays on the same page.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-7 shadow-card backdrop-blur">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-glow">
              <Heart className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Why it exists</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Splitting costs should be simple. Spreadsheets and group chats
              break down when trips get long or roommates rotate. ShareMates is
              a focused tool: groups, expenses, splits, and balances — nothing
              extra.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "btn-gradient group h-12 border-0 px-8 text-base text-white shadow-glow",
            )}
          >
            Create a free account
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
