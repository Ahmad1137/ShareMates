"use client";

import { addMemberByEmail } from "@/app/actions/groups";
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
import { Mail, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AddMemberDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    startTransition(async () => {
      const res = await addMemberByEmail(groupId, email);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("mode" in res && res.mode === "invited" && "inviteToken" in res) {
        if ("emailSent" in res && res.emailSent) {
          setInfo(`Invitation email sent to ${res.email}.`);
        } else {
          setInfo(
            `Invite created for ${res.email}, but email could not be sent${res.emailReason ? `: ${res.emailReason}` : "."} Share this link manually: ${res.inviteUrl}`,
          );
          return;
        }
      }
      if ("mode" in res && res.mode === "added") {
        setInfo(`Member ${email.toLowerCase()} added to the group.`);
      }
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-2 border-border/70 bg-background/60 px-5 backdrop-blur hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="size-4" />
        Add / Invite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-glow">
              <UserPlus className="size-5" />
            </div>
            <DialogTitle className="text-xl">Add or invite</DialogTitle>
            <DialogDescription>
              If the email is registered, they&apos;re added instantly.
              Otherwise we create an invite and send an email automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="member-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="friend@example.com"
                  required
                  className="h-11 pl-9"
                />
              </div>
            </div>
            {error ? (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive animate-fade-in"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {info ? (
              <p
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in"
                role="status"
              >
                {info}
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
                {pending ? "Processing…" : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
