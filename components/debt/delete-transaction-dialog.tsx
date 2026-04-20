"use client";

import { deleteContactTransaction } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type DeleteTransactionDialogProps = {
  contactId: string;
  transactionId: string;
};

export function DeleteTransactionDialog({
  contactId,
  transactionId,
}: DeleteTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteContactTransaction(contactId, transactionId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setShowSuccess(true);
      router.refresh();
    });
  }

  return (
    <>
      {showSuccess ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 shadow-card dark:text-emerald-300">
          Transaction deleted.
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3.5" />
        <span className="sr-only">Delete transaction</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this transaction?</DialogTitle>
            <DialogDescription>
              This will permanently remove this ledger entry. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? "Deleting..." : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
