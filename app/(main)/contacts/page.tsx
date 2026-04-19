import { listContactsWithBalances } from "@/app/actions/debt";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, HandCoins, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacts / IOU",
};

export default async function ContactsPage() {
  const contacts = await listContactsWithBalances();

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contacts</h1>
          <p className="mt-1 text-muted-foreground">
            Personal lending and borrowing (udhaar) with people you know.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/ledger"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1")}
          >
            Add transaction
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
          <Link href="/contacts/new" className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1")}>
            <Plus className="size-4" />
            Add contact
          </Link>
        </div>
      </div>

      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <HandCoins className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">Your list</CardTitle>
              <CardDescription>
                Balances include offline contacts (name-only) and linked accounts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet. Add someone you split money with.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/50">
              {contacts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.email ? (
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      ) : null}
                    </div>
                    <p
                      className={`text-sm tabular-nums ${
                        c.balance > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : c.balance < 0
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {c.balanceLabel}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
