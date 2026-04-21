"use client";

import { createGroupSettlement } from "@/app/actions/group-settlements";
import type { UserBalance } from "@/lib/balances";
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
import { useMemo, useState, useTransition } from "react";

export function GroupSettleUp({
  groupId,
  rows,
  currentUserId,
}: {
  groupId: string;
  rows: UserBalance[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const me = rows.find((r) => r.userId === currentUserId);
  const creditors = useMemo(
    () => rows.filter((r) => r.userId !== currentUserId && r.net > 0.009),
    [rows, currentUserId],
  );
  const iOwe = (me?.net ?? 0) < -0.009;
  const selectedCreditor = creditors.find((c) => c.userId === receiverId) ?? null;
  const maxPayable = selectedCreditor
    ? Math.min(Math.abs(me?.net ?? 0), selectedCreditor.net)
    : 0;

  function openDialog(prefill?: { receiverId: string; amount: number }) {
    setError(null);
    if (prefill) {
      setReceiverId(prefill.receiverId);
      setAmount(prefill.amount.toFixed(2));
    } else if (creditors[0]) {
      setReceiverId(creditors[0].userId);
      setAmount(Math.min(Math.abs(me?.net ?? 0), creditors[0].net).toFixed(2));
    }
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        setError("Enter a valid amount greater than zero.");
        return;
      }
      if (numericAmount > maxPayable + 0.0001) {
        setError("You cannot pay more than the remaining balance");
        return;
      }
      const res = await createGroupSettlement({
        groupId,
        receiverId,
        amount: numericAmount,
        note,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setNote("");
      router.refresh();
    });
  }

  if (!iOwe || creditors.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        You have no pending payment to settle right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => openDialog()} className="btn-gradient border-0 text-white">
        Settle Up
      </Button>
      <div className="space-y-2">
        {creditors.map((c) => {
          const suggested = Math.min(Math.abs(me?.net ?? 0), c.net);
          return (
            <div
              key={c.userId}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2"
            >
              <p className="text-sm">
                Pay <span className="font-medium">{c.name}</span>{" "}
                <span className="font-mono">${suggested.toFixed(2)}</span>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openDialog({ receiverId: c.userId, amount: suggested })}
              >
                Settle
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear balance</DialogTitle>
            <DialogDescription>Record who you are paying and how much.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="settle-receiver">Who are you paying?</Label>
              <select
                id="settle-receiver"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Select member</option>
                {creditors.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settle-amount">Amount</Label>
              <Input
                id="settle-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={maxPayable > 0 ? maxPayable.toFixed(2) : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {maxPayable > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Remaining balance: ${maxPayable.toFixed(2)}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settle-note">Note (optional)</Label>
              <Input
                id="settle-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Paid by cash / bank transfer..."
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save settlement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
