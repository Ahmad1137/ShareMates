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
import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AddExpenseDialog({
  groupId,
  memberCount,
}: {
  groupId: string;
  memberCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const amount = Number(String(fd.get("amount")));
    const description = String(fd.get("description") ?? "");

    startTransition(async () => {
      const res = await createExpenseWithEqualSplits({
        groupId,
        amount,
        description,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        size="sm"
        className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={() => setOpen(true)}
        disabled={memberCount === 0}
      >
        <Receipt className="size-4" />
        Add expense
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New expense</DialogTitle>
            <DialogDescription>
              You are recorded as the payer. The total is split equally across{" "}
              {memberCount} member{memberCount === 1 ? "" : "s"} (including
              you).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-desc">Description</Label>
              <Input
                id="expense-desc"
                name="description"
                placeholder="Dinner, Uber, groceries…"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
