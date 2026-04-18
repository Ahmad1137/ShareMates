import { listContactsWithBalances } from "@/app/actions/debt";
import { LedgerForms } from "@/components/debt/ledger-forms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, NotebookPen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IOU · New transaction",
};

export default async function LedgerPage() {
  const contacts = await listContactsWithBalances();
  const registered = contacts
    .filter((c) => c.contact_user_id)
    .map((c) => ({ contact_user_id: c.contact_user_id as string, name: c.name }));

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-8">
      <Link
        href="/contacts"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "inline-flex gap-1 px-0 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" />
        Contacts
      </Link>

      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <NotebookPen className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">New transaction</CardTitle>
              <CardDescription>Record lend, borrow, or settle with one person.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LedgerForms registeredContacts={registered} />
        </CardContent>
      </Card>
    </div>
  );
}
