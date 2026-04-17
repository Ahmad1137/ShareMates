import { Sparkles } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <Sparkles className="size-4" />
            </span>
            <span className="text-lg font-semibold gradient-text">
              ShareMates
            </span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Split group expenses fairly, track who paid what, and settle up
            without the spreadsheet chaos.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/features"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/about"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ShareMates. Crafted with care.
      </div>
    </footer>
  );
}
