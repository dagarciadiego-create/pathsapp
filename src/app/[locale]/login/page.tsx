import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { HeartPulse, Users, ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TEAMS } from "@/lib/teams";
import { getTeam } from "@/lib/team-session";
import { selectTeam } from "./actions";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; switch?: string }>;
}) {
  const { locale } = await params;
  const { error, switch: switching } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Login");

  // Already picked a team? Go straight in — unless they came here on
  // purpose to swap teams (?switch=1), which is how the header link works.
  const current = await getTeam();
  if (current && !switching) redirect(`/${locale}`);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-lg font-semibold text-teal-700 dark:text-teal-400">
            <HeartPulse className="h-7 w-7" aria-hidden />
            PATHSapp
          </span>
          <LocaleSwitcher />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          {t("isolationNote")}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {t("invalidTeam")}
          </p>
        )}

        {current && switching && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {t("currentlyIn", { team: current })}
          </p>
        )}

        <form action={selectTeam} className="mt-6">
          <input type="hidden" name="locale" value={locale} />
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {t("pickTeam")}
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {TEAMS.map((team) => (
                <button
                  key={team}
                  type="submit"
                  name="team"
                  value={team}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-teal-900/40 dark:hover:text-teal-200"
                >
                  {team}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Link
            href="/workshop"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
          >
            <GraduationCap className="h-4 w-4" aria-hidden />
            {t("seeChallenges")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("challengesHint")}</p>
        </div>
      </div>
    </main>
  );
}
