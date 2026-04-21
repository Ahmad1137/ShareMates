"use client";

import { addTransaction } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ContactSettleBalance({
  contactId,
  contactName,
  balance,
}: {
  contactId: string;
  contactName: string;
  balance: number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(Math.abs(balance).toFixed(2));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const iOwe = balance < 0;
  const maxSettle = Math.abs(balance);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        setError("Enter a valid amount greater than zero.");
        return;
      }
      if (numericAmount > maxSettle + 0.0001) {
        setError("You cannot pay more than the remaining balance");
        return;
      }
      const res = await addTransaction({
        contactId,
        amount: numericAmount.toString(),
        flow: "settled",
        settleDirection: iOwe ? "i_paid_them" : "they_paid_me",
        note,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (Math.abs(balance) < 0.009) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="btn-gradient border-0 text-white"
        onClick={() => setOpen(true)}
      >
        {iOwe ? "Settle Up" : "Mark received"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear balance</DialogTitle>
            <DialogDescription>
              {iOwe
                ? `Record payment to ${contactName}.`
                : `Record payment received from ${contactName}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-settle-amount">Amount</Label>
              <Input
                id="contact-settle-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={maxSettle.toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Remaining balance: ${maxSettle.toFixed(2)}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-settle-note">Note (optional)</Label>
              <Input
                id="contact-settle-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cash / transfer / UPI..."
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
