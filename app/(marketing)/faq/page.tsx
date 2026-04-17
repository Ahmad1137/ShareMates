import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about ShareMates.",
};

const faqs = [
  {
    q: "How does splitting work?",
    a: "When you add an expense, you choose an amount and who paid. ShareMates divides the total equally across everyone in that group and records each person's share. Balances reflect who has paid more than their share versus who owes more.",
  },
  {
    q: "Is ShareMates free?",
    a: "Yes. The current version is free to use: create groups, add members, and log expenses without a subscription. See our Pricing page for details.",
  },
  {
    q: "Do my friends need an account?",
    a: "Yes. Each person you add must sign up with the same email you invite, so their user record exists and they can be added to your group.",
  },
  {
    q: "Can I use unequal splits?",
    a: "Right now expenses are split equally across all members in the group. Custom percentages per expense may come in a future update.",
  },
  {
    q: "Is my data private?",
    a: "Access to your groups and expenses is restricted by account-based rules in the database. Read our Privacy Policy for what we collect and how we use it.",
  },
];

export default function FaqPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Help center
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Answers to the most common things people ask.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map(({ q, a }, i) => (
            <details
              key={q}
              className="group rounded-2xl border border-border/60 bg-card/70 p-6 shadow-card backdrop-blur transition-all hover:border-emerald-500/30 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
                <span className="font-semibold">{q}</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-transform group-open:rotate-45">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="size-3.5"
                    fill="currentColor"
                  >
                    <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Still stuck?{" "}
          <Link
            href="/contact"
            className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800 dark:text-emerald-400"
          >
            Contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
