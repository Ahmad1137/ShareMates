"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOwnVerificationEmail } from "@/app/actions/custom-auth";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function normalizeNext(nextPath: string): string {
  return nextPath.startsWith("/") ? nextPath : "/dashboard";
}

export function SignupForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const normalizedNext = normalizeNext(nextPath);
    const fallbackName = email.split("@")[0]?.trim() || "User";
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fallbackName,
          full_name: fallbackName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      const verifyRes = await sendOwnVerificationEmail();
      if (!verifyRes.ok) {
        setError(verifyRes.error ?? "Could not send verification email.");
        return;
      }
      router.replace("/verify-email");
      return;
    }

    setMessage(
      "Signup created. Disable Supabase confirm-email and use custom verification flow.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="group relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-violet-500" />
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 pl-9 transition-all duration-200 focus-visible:ring-violet-500/40"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="group relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-violet-500" />
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="h-11 pl-9 transition-all duration-200 focus-visible:ring-violet-500/40"
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
      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in">
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={loading}
        className="btn-gradient group h-11 border-0 text-white shadow-glow"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Creating account…
          </span>
        ) : (
          <>
            <UserPlus className="mr-2 size-4 transition-transform duration-300 group-hover:scale-110" />
            Create account
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(normalizeNext(nextPath))}`}
          className="font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
