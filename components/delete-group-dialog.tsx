"use client";

import { deleteGroup } from "@/app/actions/groups";
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
import { useState, useTransition } from "react";

type DeleteGroupDialogProps = {
  groupId: string;
  groupName: string;
};

export function DeleteGroupDialog({ groupId, groupName }: DeleteGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteGroup(groupId);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.push("/groups");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-2 border-destructive/40 bg-background/60 px-5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete group
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-xl">Delete this group?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{groupName}</strong> and all its
              members, expenses, and splits. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? "Deleting..." : "Yes, delete group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
