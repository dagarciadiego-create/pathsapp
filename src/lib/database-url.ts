// Netlify DB injects NETLIFY_DATABASE_URL (pooled) and
// NETLIFY_DATABASE_URL_UNPOOLED (direct) automatically once the extension is
// enabled on the site — no manual env var setup required. DATABASE_URL, if
// set explicitly (e.g. local development), always wins. The unpooled URL is
// preferred over the pooled one because Prisma Migrate's advisory locks
// don't work reliably through a transaction-mode pooler.
export function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ??
    process.env.NETLIFY_DATABASE_URL;

  if (!url) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL (see .env.example) or enable Netlify DB on this site."
    );
  }

  return url;
}
