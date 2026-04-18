"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addContact } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddContactForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    setPending(true);
    const res = await addContact(fd);
    setPending(false);
    if (res.ok) {
      router.refresh();
      router.replace("/contacts");
    } else setMsg({ tone: "err", text: res.error });
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="friend@example.com" />
        <p className="text-xs text-muted-foreground">
          If this email matches a ShareMates user, balances and the ledger work for them. Otherwise the contact is
          stored for your reference only.
        </p>
      </div>
      {msg ? (
        <p className={`text-sm ${msg.tone === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
          {msg.text}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save contact"}
      </Button>
    </form>
  );
}
