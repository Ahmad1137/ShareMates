"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRelayTransaction, addTransaction } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LedgerContactOption = {
  id: string;
  contact_user_id: string | null;
  name: string;
  email: string;
  balance: number;
  balanceLabel: string;
};

type Flow = "i_gave" | "i_received" | "settled";

export function LedgerForms({ contacts }: { contacts: LedgerContactOption[] }) {
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>("i_gave");
  const [settleDirection, setSettleDirection] = useState<
    "i_paid_them" | "they_paid_me"
  >("i_paid_them");
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  const [relayMsg, setRelayMsg] = useState<{
    tone: "ok" | "err";
    text: string;
  } | null>(null);
  const [relayPending, setRelayPending] = useState(false);
  async function onSubmitSingle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const contactId = String(fd.get("contact_id") ?? "");
    const amount = String(fd.get("amount") ?? "");
    const note = String(fd.get("note") ?? "");
    setPending(true);
    const res = await addTransaction({
      contactId,
      amount,
      flow,
      settleDirection: flow === "settled" ? settleDirection : undefined,
      note,
    });
    setPending(false);
    if (res.ok) {
      form.reset();
      router.replace(`/contacts/${contactId}`);
      router.refresh();
    } else setMsg({ tone: "err", text: res.error });
  }

  async function onSubmitRelay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRelayMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const lenderContactId = String(fd.get("lender_contact_id") ?? "");
    const recipientContactId = String(fd.get("recipient_contact_id") ?? "");
    const amount = String(fd.get("amount") ?? "");
    const note = String(fd.get("note") ?? "");
    setRelayPending(true);
    const res = await addRelayTransaction({
      lenderContactId,
      recipientContactId,
      amount,
      note,
    });
    setRelayPending(false);
    if (res.ok) {
      form.reset();
      router.replace(`/contacts/${recipientContactId || lenderContactId}`);
      router.refresh();
    } else setRelayMsg({ tone: "err", text: res.error });
  }

  if (contacts.length < 1) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a contact to start recording IOU transactions.
      </p>
    );
  }

  const selectClass =
    "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <div className="space-y-10">
      <form onSubmit={(e) => void onSubmitSingle(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact_id">Contact</Label>
          <select id="contact_id" name="contact_id" required className={selectClass}>
            <option value="">Choose…</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {!c.contact_user_id ? " (offline)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flow">Type</Label>
          <select
            id="flow"
            name="flow"
            className={selectClass}
            value={flow}
            onChange={(e) => setFlow(e.target.value as Flow)}
          >
            <option value="i_gave">I gave / lent (they owe me)</option>
            <option value="i_received">
              I received / borrowed (I owe them)
            </option>
            <option value="settled">Settlement payment</option>
          </select>
        </div>
        {flow === "settled" ? (
          <div className="space-y-2">
            <Label htmlFor="settle_dir">Who paid?</Label>
            <select
              id="settle_dir"
              className={selectClass}
              value={settleDirection}
              onChange={(e) =>
                setSettleDirection(
                  e.target.value as "i_paid_them" | "they_paid_me",
                )
              }
            >
              <option value="i_paid_them">I paid them</option>
              <option value="they_paid_me">They paid me</option>
            </select>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <textarea
            id="note"
            name="note"
            rows={2}
            className="flex min-h-[4rem] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        {msg ? (
          <p
            className={`text-sm ${
              msg.tone === "ok"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {msg.text}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Add entry"}
        </Button>
      </form>

      <div className="border-t border-border/60 pt-8">
        <h3 className="text-sm font-semibold">Borrow from A, give to B</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Creates two rows: A → you (borrow), then you → B (lend). Works with offline
          contacts too; add both people to your list first.
        </p>
        <form
          onSubmit={(e) => void onSubmitRelay(e)}
          className="mt-4 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lender_contact_id">Borrow from (A)</Label>
              <select
                id="lender_contact_id"
                name="lender_contact_id"
                required
                className={selectClass}
              >
                <option value="">Choose…</option>
                {contacts.map((c) => (
                  <option key={`L-${c.id}`} value={c.id}>
                    {c.name}
                    {!c.contact_user_id ? " (offline)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_contact_id">Lend to (B)</Label>
              <select
                id="recipient_contact_id"
                name="recipient_contact_id"
                required
                className={selectClass}
              >
                <option value="">Choose…</option>
                {contacts.map((c) => (
                  <option key={`R-${c.id}`} value={c.id}>
                    {c.name}
                    {!c.contact_user_id ? " (offline)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relay_amount">Amount</Label>
            <Input
              id="relay_amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relay_note">Note (optional)</Label>
            <textarea
              id="relay_note"
              name="note"
              rows={2}
              className="flex min-h-[4rem] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>
          {relayMsg ? (
            <p
              className={`text-sm ${relayMsg.tone === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
            >
              {relayMsg.text}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="secondary"
            disabled={relayPending}
            className="w-full sm:w-auto"
          >
            {relayPending ? "Saving…" : "Save relay (2 entries)"}
          </Button>
        </form>
      </div>
    </div>
  );
}
