/**
 * Public site origin for server-side links (emails, invite URLs). No trailing slash.
 *
 * Order:
 * 1. NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL (set in .env.local / Vercel)
 * 2. https://VERCEL_URL (set automatically on Vercel for prod and preview)
 * 3. http://localhost:$PORT (local `next dev`)
 */
export function getPublicSiteOrigin(): string {
  let explicit = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).trim();
  // Safety: some hosts accidentally store env as "KEY=https://domain".
  // Normalize by stripping any leading "<SOMETHING>=" prefix.
  explicit = explicit.replace(/^[A-Z0-9_]+=+/i, "").trim();
  if (explicit) {
    const base = explicit.replace(/\/+$/, "");
    return base.includes("://") ? base : `https://${base}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/\/+$/, "");
    return `https://${host}`;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}
