"use client";

import { createGroup } from "@/app/actions/groups";
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
import { Plus, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await createGroup(fd);
        if (res && "error" in res && res.error) {
          setError(res.error);
          return;
        }
        setOpen(false);
        router.refresh();
      } catch {
        // Server action called redirect() — navigation is handled by Next.js.
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="btn-gradient group h-10 gap-2 border-0 px-5 text-white shadow-glow"
      >
        <Plus className="size-4 transition-transform group-hover:rotate-90" />
        New group
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <UsersRound className="size-5" />
            </div>
            <DialogTitle className="text-xl">Create group</DialogTitle>
            <DialogDescription>
              You will be added as the first member. Invite others by email on
              the group page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input
                id="group-name"
                name="name"
                placeholder="Weekend trip, Apartment…"
                required
                autoFocus
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
                disabled={pending}
                className="btn-gradient h-10 border-0 text-white shadow-glow"
              >
                {pending ? "Creating…" : "Create group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
