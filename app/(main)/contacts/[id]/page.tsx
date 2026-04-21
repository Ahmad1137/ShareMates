import { getContactLedgerBalance, getTransactionsForContactRow } from "@/app/actions/debt";
import { ContactSettleBalance } from "@/components/debt/contact-settle-balance";
import { DeleteTransactionDialog } from "@/components/debt/delete-transaction-dialog";
import { describeDebtTransactionForViewer } from "@/lib/debt/describe-transaction";
import { formatDebtBalanceLabel } from "@/lib/debt/balance";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { ArrowLeft, ScrollText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await getTransactionsForContactRow(id);
  if (!row) return { title: "Contact" };
  return { title: `${row.contact.name} · IOU` };
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const bundle = await getTransactionsForContactRow(id);
  if (!bundle) notFound();

  const { contact, transactions } = bundle;
  const balance = await getContactLedgerBalance(user.id, contact.id);
  const balanceLabel = formatDebtBalanceLabel(balance);

  const ids = new Set<string>();
  for (const t of transactions) {
    if (t.sender_id) ids.add(t.sender_id);
    if (t.receiver_id) ids.add(t.receiver_id);
  }
  ids.add(user.id);

  const supabase = await createClient();
  const { data: users } =
    ids.size > 0
      ? await supabase.from("users").select("id, name").in("id", [...ids])
      : { data: [] as { id: string; name: string }[] };

  const nameByUserId = new Map((users ?? []).map((u) => [u.id, u.name]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <Link
        href="/contacts"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "inline-flex gap-1 px-0 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" />
        All contacts
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{contact.name}</h1>
        {contact.email ? <p className="text-sm text-muted-foreground">{contact.email}</p> : null}
        <p
          className={`mt-3 text-lg font-medium tabular-nums ${
            balance > 0
              ? "text-emerald-700 dark:text-emerald-400"
              : balance < 0
                ? "text-amber-700 dark:text-amber-400"
                : "text-muted-foreground"
          }`}
        >
          {balanceLabel}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ContactSettleBalance
            contactId={contact.id}
            contactName={contact.name}
            balance={balance}
          />
          <Link href="/ledger" className={cn(buttonVariants({ size: "sm" }), "inline-flex")}>
            Add transaction
          </Link>
        </div>
      </div>

      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-glow">
              <ScrollText className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">History</CardTitle>
              <CardDescription>Entries between you and this person.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ledger entries yet.</p>
          ) : (
            <ul className="space-y-3">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm"
                >
                  <div className="mb-1 flex justify-end">
                    <DeleteTransactionDialog
                      contactId={contact.id}
                      transactionId={t.id}
                    />
                  </div>
                  <p>
                    {describeDebtTransactionForViewer(
                      t,
                      user.id,
                      nameByUserId,
                      contact.name,
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span className="uppercase tracking-wide">{t.type}</span>
                    <span>{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  {t.note ? <p className="mt-1 text-xs text-muted-foreground">{t.note}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
