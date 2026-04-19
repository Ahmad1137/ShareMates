"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function normalizeNext(nextPath: string): string {
  return nextPath.startsWith("/") ? nextPath : "/dashboard";
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Single navigation; avoid refresh + push (two full RSC passes).
    router.replace(normalizeNext(nextPath));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="group relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-violet-500" />
          <Input
            id="login-email"
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
        <Label htmlFor="login-password">Password</Label>
        <div className="group relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-violet-500" />
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
      <Button
        type="submit"
        disabled={loading}
        className="btn-gradient group h-11 border-0 text-white shadow-glow"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Signing in…
          </span>
        ) : (
          <>
            <LogIn className="mr-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            Sign in
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(normalizeNext(nextPath))}`}
          className="font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
