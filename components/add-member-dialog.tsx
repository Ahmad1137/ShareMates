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
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AddMemberDialog({
  groupId,
}: {
  groupId: string;
}) {
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
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="size-4" />
        Add / Invite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add or invite</DialogTitle>
            <DialogDescription>
              If the email is registered, they are added instantly. Otherwise we
              create an invite and send an email automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="friend@example.com"
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
                {info}
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
                {pending ? "Processing…" : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
