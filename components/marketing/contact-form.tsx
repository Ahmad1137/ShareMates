"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useState } from "react";

const SUPPORT_EMAIL = "support@sharemates.app";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const subject = encodeURIComponent(
      String(fd.get("subject") || "ShareMates support"),
    );
    const body = encodeURIComponent(
      `Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\n\n${fd.get("message")}`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Your name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="How can we help?" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="flex w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground transition-colors focus-visible:border-emerald-500/60 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20"
          placeholder="Describe your question or issue…"
        />
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          className="btn-gradient group h-11 border-0 text-white shadow-glow sm:w-auto"
        >
          <Send className="mr-2 size-4 transition-transform group-hover:translate-x-0.5" />
          Send message
        </Button>
        <p className="text-xs text-muted-foreground">
          Opens your email app to{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
      {sent ? (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          If your mail client opened, you&apos;re all set. Otherwise copy the
          address above.
        </p>
      ) : null}
    </form>
  );
}
