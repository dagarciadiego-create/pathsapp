import { getTranslations } from "next-intl/server";
import { HeartPulse } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

// Deliberately does not reuse the internal (app) layout: the public
// transparency page must never inherit the admin navigation, edit
// controls, or internal-only sections (contacts, calendar, reports).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <PublicFooterNotice />
      </footer>
    </>
  );
}

async function PublicFooterNotice() {
  const t = await getTranslations("Footer");
  return <p className="px-4">{t("privacyNotice", { year: new Date().getFullYear() })}</p>;
}

async function PublicHeader() {
  const tNav = await getTranslations("Nav");
  const tPublic = await getTranslations("PublicPage");

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400">
          <HeartPulse className="h-6 w-6" aria-hidden />
          {tNav("brand")}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {tPublic("internalLink")}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
