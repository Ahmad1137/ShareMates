import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 glass-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </span>
          <span className="gradient-text">ShareMates</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-0 -z-0 rounded-lg bg-accent/0 transition-colors group-hover:bg-accent/60" />
            </Link>
          ))}
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
