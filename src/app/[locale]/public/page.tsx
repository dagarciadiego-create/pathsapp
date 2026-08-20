import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Sparkles, Gauge } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { computeGoalProgress, formatDate, formatIndicatorValue, percentOf } from "@/lib/goal-helpers";

export const dynamic = "force-dynamic";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Scoped like every other page: this is the team's own public view,
  // not a shared page pooling all ten teams' achievements together.
  const team = await requireTeam(locale);

  const [t, tEnums, achievedGoals, inProgressGoals, globalIndicators] = await Promise.all([
    getTranslations("PublicPage"),
    getTranslations("Enums"),
    prisma.advocacyGoal.findMany({
      where: { team, status: "ACHIEVED" },
      include: { subtasks: { select: { status: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.advocacyGoal.findMany({
      where: { team, status: "IN_PROGRESS" },
      include: { subtasks: { select: { status: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.indicator.findMany({
      where: {
        team,
        OR: [{ goalId: null }, { goal: { status: { in: ["ACHIEVED", "IN_PROGRESS"] } } }],
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
          {t("achievedTitle")}
        </h2>
        {achievedGoals.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noAchieved")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {achievedGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/20"
              >
                {goal.category && (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {goal.category}
                  </p>
                )}
                <p className="font-semibold text-slate-900 dark:text-slate-100">{goal.name}</p>
                {goal.description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {goal.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Sparkles className="h-5 w-5 text-teal-600" aria-hidden />
          {t("inProgressTitle")}
        </h2>
        {inProgressGoals.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noInProgress")}</p>
        ) : (
          <div className="space-y-3">
            {inProgressGoals.map((goal) => {
              const { done, total, percent } = computeGoalProgress(goal.subtasks);
              const dateLabel = formatDate(goal.targetDate, locale);
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{goal.name}</p>
                    {dateLabel && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tEnums(`goalKind.${goal.kind}` as never)} · {dateLabel}
                      </span>
                    )}
                  </div>
                  {goal.category && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {goal.category}
                    </p>
                  )}
                  {total > 0 && (
                    <>
                      <ProgressBar percent={percent ?? 0} className="mb-1" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {done} / {total}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Gauge className="h-5 w-5 text-indigo-600" aria-hidden />
          {t("indicatorsTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {globalIndicators.map((indicator) => {
            const percent = percentOf(indicator);
            return (
              <StatCard
                key={indicator.id}
                label={indicator.name}
                value={`${formatIndicatorValue(indicator.currentValue, indicator.unit, locale)} (${percent}%)`}
                tone={percent >= 100 ? "success" : "default"}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
