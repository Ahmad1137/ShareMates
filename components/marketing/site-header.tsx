"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 glass-strong shadow-card"
          : "border-transparent glass",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 md:px-6",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Sparkles className="size-4" />
          </span>
          <span className="gradient-text">ShareMates</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-underline relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "btn-gradient border-0 text-white shadow-glow",
              )}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "btn-gradient border-0 text-white shadow-glow",
                )}
              >
                Sign up
              </Link>
            </>
          )}

          <details className="relative md:hidden">
            <summary className="list-none [&::-webkit-details-marker]:hidden">
              <span className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/60 backdrop-blur transition-colors hover:bg-accent">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border/80 glass-strong py-1 text-popover-foreground shadow-card animate-scale-in">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              {!loggedIn ? (
                <Link
                  href="/login"
                  className="block border-t border-border/60 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
