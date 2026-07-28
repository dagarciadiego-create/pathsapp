import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, static files, and the generated
  // PWA icon/manifest routes (they have no file extension in their URL,
  // so they'd otherwise be treated as pages needing a locale prefix).
  matcher: [
    "/((?!api|_next|_vercel|icon$|apple-icon$|icons/|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
