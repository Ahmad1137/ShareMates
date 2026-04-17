import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of use for ShareMates.",
};

export default function TermsPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/70 p-8 shadow-card backdrop-blur md:p-12 animate-fade-up">
      <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Legal
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: April 17, 2026
      </p>
      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground">
        <p>
          These Terms &amp; Conditions (“Terms”) govern your access to and use
          of ShareMates (the “Service”). By creating an account or using the
          Service, you agree to these Terms. If you do not agree, do not use the
          Service.
        </p>

        <h2 className="text-xl text-foreground">1. The Service</h2>
        <p>
          ShareMates provides tools to organize shared expenses within groups.
          Features may change, be suspended, or discontinued. We strive for
          reliability but do not guarantee uninterrupted or error-free
          operation.
        </p>

        <h2 className="text-xl text-foreground">2. Eligibility</h2>
        <p>
          You must be able to form a binding contract in your jurisdiction and
          meet any minimum age requirements. You are responsible for the
          accuracy of information you provide.
        </p>

        <h2 className="text-xl text-foreground">3. Your account</h2>
        <p>
          You are responsible for safeguarding your credentials and for
          activity under your account. Notify us promptly (via{" "}
          <Link href="/contact" className="text-foreground underline">
            Contact
          </Link>
          ) if you suspect unauthorized access.
        </p>

        <h2 className="text-xl text-foreground">4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for unlawful purposes or to violate others’ rights</li>
          <li>Attempt to probe, scan, or test vulnerabilities without authorization</li>
          <li>Interfere with or overload the Service</li>
          <li>Scrape or harvest data in bulk without permission</li>
          <li>Misrepresent your identity or affiliation</li>
        </ul>

        <h2 className="text-xl text-foreground">5. User content</h2>
        <p>
          You retain rights to content you submit. You grant us a limited license
          to host, process, and display that content solely to operate the
          Service. You represent that you have the rights needed to share such
          content.
        </p>

        <h2 className="text-xl text-foreground">6. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES
          OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM
          EXTENT PERMITTED BY LAW.
        </p>

        <h2 className="text-xl text-foreground">7. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHAREMATES AND ITS OPERATORS
          WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR
          GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY
          FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF
          (A) AMOUNTS YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B)
          ONE HUNDRED U.S. DOLLARS (OR LOCAL EQUIVALENT), IF YOU HAVE NOT PAID
          ANYTHING.
        </p>

        <h2 className="text-xl text-foreground">8. Indemnity</h2>
        <p>
          You will defend and indemnify us against claims arising from your use
          of the Service, your content, or your violation of these Terms, to the
          extent permitted by law.
        </p>

        <h2 className="text-xl text-foreground">9. Termination</h2>
        <p>
          We may suspend or terminate access to the Service for conduct that we
          believe violates these Terms or harms other users or the Service. You
          may stop using the Service at any time.
        </p>

        <h2 className="text-xl text-foreground">10. Governing law</h2>
        <p>
          These Terms are governed by the laws of the jurisdiction you designate
          for your company (replace this with your chosen venue before
          production), without regard to conflict-of-law rules.
        </p>

        <h2 className="text-xl text-foreground">11. Changes</h2>
        <p>
          We may modify these Terms. We will post the updated Terms with a new
          “Last updated” date. Material changes may be communicated in-app or by
          email where appropriate. Continued use after changes constitutes
          acceptance.
        </p>

        <h2 className="text-xl text-foreground">12. Contact</h2>
        <p>
          Questions about these Terms? Use our{" "}
          <Link href="/contact" className="text-foreground underline">
            Contact
          </Link>{" "}
          page.
        </p>

        <p className="text-sm italic">
          This template is not legal advice. Have qualified counsel review and
          adapt for your entity and jurisdiction before production.
        </p>
      </div>
      </div>
    </div>
  );
}
