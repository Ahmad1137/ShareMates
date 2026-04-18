"use client";

import { createExpenseWithEqualSplits } from "@/app/actions/expenses";
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
import { Calendar, DollarSign, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function isoTodayLocal() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AddExpenseDialog({
  groupId,
  memberCount,
}: {
  groupId: string;
  memberCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [spentOn, setSpentOn] = useState(() => isoTodayLocal());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const router = useRouter();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSpentOn(isoTodayLocal());
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const amount = Number(String(fd.get("amount")));
    const description = String(fd.get("description") ?? "");

    try {
      const res = await createExpenseWithEqualSplits({
        groupId,
        amount,
        description,
        spentOn,
      });

      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }

      form.reset();
      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Expense submit error", err);
      setError("Unable to save expense. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="btn-gradient h-10 gap-2 border-0 px-5 text-white shadow-glow"
        onClick={() => setOpen(true)}
        disabled={memberCount === 0}
      >
        <Receipt className="size-4" />
        Add expense
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <Receipt className="size-5" />
            </div>
            <DialogTitle className="text-xl">New expense</DialogTitle>
            <DialogDescription>
              You are recorded as the payer. The total is split equally across{" "}
              <span className="font-medium text-foreground">
                {memberCount} member{memberCount === 1 ? "" : "s"}
              </span>{" "}
              (including you).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="expense-date">Date</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="expense-date"
                  type="date"
                  value={spentOn}
                  onChange={(e) => setSpentOn(e.target.value)}
                  required
                  className="h-11 pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="h-11 pl-9 font-mono text-base tabular-nums"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-desc">Description</Label>
              <Input
                id="expense-desc"
                name="description"
                placeholder="Dinner, Uber, groceries…"
                className="h-11"
              />
            </div>
            {error ? (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive animate-fade-in"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending || isRefreshing}
                className="btn-gradient h-10 border-0 text-white shadow-glow"
              >
                {pending || isRefreshing ? "Saving…" : "Save expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
