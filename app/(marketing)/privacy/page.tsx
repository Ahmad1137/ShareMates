import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShareMates collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/70 p-8 shadow-card backdrop-blur md:p-12 animate-fade-up">
      <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Legal
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: April 17, 2026
      </p>
      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground">
        <p>
          This Privacy Policy describes how ShareMates (“we”, “us”, or “our”)
          handles information when you use our website and application
          (collectively, the “Service”). By using the Service, you agree to this
          policy. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-xl text-foreground">1. Information we collect</h2>
        <ul>
          <li>
            <strong className="text-foreground">Account data:</strong> When you
            register, we collect your email address and any profile details you
            provide (such as display name). Authentication may be processed by
            our infrastructure provider (e.g. Supabase).
          </li>
          <li>
            <strong className="text-foreground">Expense data:</strong> Content
            you create — group names, member relationships, expense amounts,
            descriptions, and split records — is stored to provide the Service.
          </li>
          <li>
            <strong className="text-foreground">Technical data:</strong> Like
            most web apps, servers may log basic technical information (e.g. IP
            address, browser type, timestamps) for security and reliability.
          </li>
        </ul>

        <h2 className="text-xl text-foreground">2. How we use information</h2>
        <p>We use the information above to:</p>
        <ul>
          <li>Create and manage your account</li>
          <li>Provide group and expense features you request</li>
          <li>Maintain security, prevent abuse, and troubleshoot issues</li>
          <li>Comply with legal obligations where applicable</li>
        </ul>

        <h2 className="text-xl text-foreground">3. Sharing</h2>
        <p>
          We do not sell your personal information. We may share data with
          service providers that host or process data on our behalf (for
          example, database and authentication vendors), subject to contractual
          safeguards. We may disclose information if required by law or to
          protect rights and safety.
        </p>

        <h2 className="text-xl text-foreground">4. Retention</h2>
        <p>
          We retain your information for as long as your account is active or
          as needed to provide the Service. You may request deletion of your
          account subject to any legal retention requirements.
        </p>

        <h2 className="text-xl text-foreground">5. Security</h2>
        <p>
          We use industry-standard measures appropriate to the nature of the
          Service. No method of transmission or storage is 100% secure; you use
          the Service at your own risk.
        </p>

        <h2 className="text-xl text-foreground">6. Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          or delete personal data, or to object to certain processing. Contact
          us using the details on our Contact page to make a request.
        </p>

        <h2 className="text-xl text-foreground">7. Children</h2>
        <p>
          The Service is not directed at children under 13 (or the minimum age
          in your jurisdiction). We do not knowingly collect personal
          information from children.
        </p>

        <h2 className="text-xl text-foreground">8. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the
          updated version with a new “Last updated” date. Continued use after
          changes constitutes acceptance of the revised policy.
        </p>

        <h2 className="text-xl text-foreground">9. Contact</h2>
        <p>
          Questions about privacy? Reach out via the Contact page. Replace this
          section with a legal entity name and physical or email contact before
          production if required in your jurisdiction.
        </p>

        <p className="text-sm italic">
          This template is for informational purposes only and does not
          constitute legal advice. Have qualified counsel review before launch.
        </p>
      </div>
      </div>
    </div>
  );
}
