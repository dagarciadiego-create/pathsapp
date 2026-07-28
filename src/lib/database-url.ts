// Netlify DB injects NETLIFY_DATABASE_URL (pooled) and
// NETLIFY_DATABASE_URL_UNPOOLED (direct) automatically once the extension is
// enabled on the site — no manual env var setup required. DATABASE_URL, if
// set explicitly (e.g. local development), always wins. The unpooled URL is
// preferred over the pooled one because Prisma Migrate's advisory locks
// don't work reliably through a transaction-mode pooler.
//
// Returns undefined (rather than throwing) when nothing is set: `prisma
// generate` loads this config during `npm install`'s postinstall step, before
// Netlify has injected the extension's env vars into the build — it doesn't
// need a real connection, so it must not fail here. Commands that actually
// need to connect (migrate deploy, db seed, runtime queries) surface their
// own clear connection error instead.
export function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ??
    process.env.NETLIFY_DATABASE_URL
  );
}
