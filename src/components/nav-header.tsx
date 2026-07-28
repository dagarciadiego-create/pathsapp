"use client";

import { useTranslations } from "next-intl";
import { HeartPulse, ClipboardList, Gauge } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { clsx } from "clsx";

export function NavHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  const links = [
    { href: "/", label: t("home"), icon: ClipboardList },
    { href: "/indicators", label: t("indicators"), icon: Gauge },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400">
          <HeartPulse className="h-6 w-6" aria-hidden />
          <span>{t("brand")}</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
