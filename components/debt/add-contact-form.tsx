"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addContact } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddContactForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    const res = await addContact(fd);
    setPending(false);
    if (res.ok) {
      form.reset();
      router.refresh();
      const successText = res.emailSent
        ? "Contact saved. Notification email sent."
        : res.emailSent === false
          ? `Contact saved. Email could not be sent: ${res.emailReason}`
          : "Contact saved.";
      setMsg({ tone: "ok", text: successText });
    } else {
      setMsg({ tone: "err", text: res.error });
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="friend@example.com (optional)"
        />
        <p className="text-xs text-muted-foreground">
          Optional: if it matches someone on ShareMates, they link automatically. You can
          still track IOU with them offline without email.
        </p>
      </div>
      {msg ? (
        <p
          className={`text-sm ${msg.tone === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
        >
          {msg.text}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save contact"}
      </Button>
    </form>
  );
}
