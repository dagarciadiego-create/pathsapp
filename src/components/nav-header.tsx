"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  HeartPulse,
  ClipboardList,
  Gauge,
  BookUser,
  CalendarDays,
  Hourglass,
  Target,
  GraduationCap,
  Landmark,
  Mic,
  FileDown,
  ScrollText,
  FileSignature,
  Newspaper,
  Globe,
  Menu,
  X,
  ChevronDown,
  Users,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { clsx } from "clsx";

export function NavHeader({ team }: { team: string | null }) {
  const t = useTranslations("Nav");
  const tTeam = useTranslations("TeamBadge");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // The header row is capped at max-w-6xl, and a fully flat nav no longer
  // fits every page link at that width. Split by how often each page gets
  // checked: day-to-day operational views stay inline, periodic
  // planning/reporting views move into a "More" dropdown.
  const primaryLinks = [
    { href: "/", label: t("home"), icon: ClipboardList },
    { href: "/workshop", label: t("workshop"), icon: GraduationCap },
    { href: "/contacts", label: t("contacts"), icon: BookUser },
    { href: "/calendar", label: t("calendar"), icon: CalendarDays },
    { href: "/deadlines", label: t("deadlines"), icon: Hourglass },
  ];
  const moreLinks = [
    { href: "/triage", label: t("triage"), icon: Target },
    { href: "/positions", label: t("positions"), icon: Landmark },
    { href: "/spokespeople", label: t("spokespeople"), icon: Mic },
    { href: "/petitions", label: t("petitions"), icon: ScrollText },
    { href: "/joint-letters", label: t("jointLetters"), icon: FileSignature },
    { href: "/media-coverage", label: t("mediaCoverage"), icon: Newspaper },
    { href: "/indicators", label: t("indicators"), icon: Gauge },
    { href: "/reports", label: t("reports"), icon: FileDown },
    { href: "/public", label: t("publicPage"), icon: Globe },
  ];
  const allLinks = [...primaryLinks, ...moreLinks];

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const moreActive = moreLinks.some((link) => isActive(link.href));

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  const linkClass = (active: boolean) =>
    clsx(
      "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    );

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

        {/* Shown at every width on purpose: in a room of ten teams the
            most important thing on screen is whose data this is. On the
            workshop challenges page, which is readable before a team is
            assigned, it becomes the invitation to pick one. */}
        <Link
          href="/login?switch=1"
          title={team ? tTeam("switch") : tTeam("chooseTeam")}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
        >
          <Users className="h-3.5 w-3.5" aria-hidden />
          {team ? (
            <>
              <span className="sr-only">{tTeam("label")}: </span>
              {team}
            </>
          ) : (
            tTeam("chooseTeam")
          )}
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {primaryLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(isActive(href))}>
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        {/* Deliberately outside the primary <nav>: an absolutely-positioned
            dropdown inside a container that ever needs overflow-x-auto
            would get clipped, since setting overflow on one axis forces
            the other to "auto" too (a real bug caught in browser testing). */}
        <div className="relative hidden lg:block" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={linkClass(moreActive)}
          >
            {t("more")}
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full mt-1 min-w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {moreLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive(href)
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 lg:ml-auto lg:flex">
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
          {allLinks.map(({ href, label, icon: Icon }) => (
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
            href="/login?switch=1"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            <Users className="h-4 w-4" aria-hidden />
            {team ? tTeam("switch") : tTeam("chooseTeam")}
          </Link>
          <div className="px-3 py-2">
            <LocaleSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
