import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  PieChart,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description: "Group expenses, split bills, and track balances with ShareMates.",
};

const items = [
  {
    icon: Users,
    title: "Group expenses",
    description:
      "Create groups for trips, households, or events. Everyone sees the same running list of costs.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Split bills",
    description:
      "Add an expense, choose who paid, and split the total equally across all members in one step.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Track balances",
    description:
      "Net balances show who has fronted more versus their share — the core \"who owes whom\" picture.",
    color: "from-cyan-500 to-sky-600",
  },
  {
    icon: PieChart,
    title: "Fair shares",
    description:
      "Equal splits use cent-accurate math so the group total always adds up with no penny drift.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Your account",
    description:
      "Sign in with email and password. Your data is tied to your account and protected by Row Level Security in the database.",
    color: "from-blue-500 to-indigo-600",
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Features
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Built for clarity
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            ShareMates is focused on fewer tabs, fewer formulas, and faster
            settle-up conversations.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map(({ icon: Icon, title, description, color }, i) => (
            <li
              key={title}
              className="group relative flex gap-5 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-card backdrop-blur hover-lift animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow transition-transform group-hover:scale-110",
                  color,
                )}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex justify-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "btn-gradient group h-12 border-0 px-8 text-base text-white shadow-glow",
            )}
          >
            Try ShareMates free
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
