"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  HeartPulse,
  ClipboardList,
  Gauge,
  BookUser,
  CalendarDays,
  Hourglass,
  FileDown,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { clsx } from "clsx";

export function NavHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: t("home"), icon: ClipboardList },
    { href: "/contacts", label: t("contacts"), icon: BookUser },
    { href: "/calendar", label: t("calendar"), icon: CalendarDays },
    { href: "/deadlines", label: t("deadlines"), icon: Hourglass },
    { href: "/indicators", label: t("indicators"), icon: Gauge },
    { href: "/reports", label: t("reports"), icon: FileDown },
  ];

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400"
        >
          <HeartPulse className="h-6 w-6" aria-hidden />
          <span>{t("brand")}</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:ml-auto lg:flex">
          <Link
            href="/public"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Globe className="h-4 w-4" aria-hidden />
            {t("publicPage")}
          </Link>
          <LocaleSwitcher />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t("menu")}
          aria-expanded={menuOpen}
          className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-200 px-4 py-2 dark:border-slate-800 lg:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive(href)
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
          <Link
            href="/public"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            <Globe className="h-4 w-4" aria-hidden />
            {t("publicPage")}
          </Link>
          <div className="px-3 py-2">
            <LocaleSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
