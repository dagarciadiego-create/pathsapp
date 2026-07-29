"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { clsx } from "clsx";
import { Link, useRouter } from "@/i18n/navigation";
import { Section } from "./ui/section";
import { formatDate, isGoalOverdue } from "@/lib/goal-helpers";
import { TRIAGE_QUADRANTS, triageQuadrant, compareByUrgency } from "@/lib/triage-helpers";
import type { TriageQuadrant } from "@/lib/triage-helpers";
import { api } from "@/lib/api-client";
import type { TriageGoal } from "@/lib/types";

const QUADRANT_CARD_STYLES: Record<TriageQuadrant, string> = {
  QUICK_WIN: "border-emerald-200 dark:border-emerald-900/60",
  MAJOR_PROJECT: "border-blue-200 dark:border-blue-900/60",
  FILL_IN: "border-slate-200 dark:border-slate-800",
  THANKLESS: "border-amber-200 dark:border-amber-900/60",
};

const QUADRANT_HEADER_STYLES: Record<TriageQuadrant, string> = {
  QUICK_WIN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  MAJOR_PROJECT: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  FILL_IN: "bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  THANKLESS: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export function TriagePage({ goals }: { goals: TriageGoal[] }) {
  const t = useTranslations("Triage");

  const { byQuadrant, unscored } = useMemo(() => {
    const byQuadrant: Record<TriageQuadrant, TriageGoal[]> = {
      QUICK_WIN: [],
      MAJOR_PROJECT: [],
      FILL_IN: [],
      THANKLESS: [],
    };
    const unscored: TriageGoal[] = [];
    for (const goal of goals) {
      const quadrant = triageQuadrant(goal);
      if (!quadrant) {
        unscored.push(goal);
        continue;
      }
      byQuadrant[quadrant].push(goal);
    }
    for (const quadrant of TRIAGE_QUADRANTS) {
      byQuadrant[quadrant].sort(compareByUrgency);
    }
    return { byQuadrant, unscored };
  }, [goals]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      {goals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <div className="space-y-6">
          {unscored.length > 0 && (
            <Section title={t("unscoredTitle")} subtitle={t("unscoredSubtitle")}>
              <ul className="space-y-2">
                {unscored.map((goal) => (
                  <UnscoredRow key={goal.id} goal={goal} />
                ))}
              </ul>
            </Section>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TRIAGE_QUADRANTS.map((quadrant) => (
              <div
                key={quadrant}
                className={clsx(
                  "overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900",
                  QUADRANT_CARD_STYLES[quadrant]
                )}
              >
                <div className={clsx("px-4 py-3", QUADRANT_HEADER_STYLES[quadrant])}>
                  <p className="font-semibold">{t(`quadrant.${quadrant}.title`)}</p>
                  <p className="text-xs opacity-80">{t(`quadrant.${quadrant}.hint`)}</p>
                </div>
                <div className="p-2">
                  {byQuadrant[quadrant].length === 0 ? (
                    <p className="px-2 py-2 text-sm text-slate-400 dark:text-slate-500">
                      {t("quadrantEmpty")}
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {byQuadrant[quadrant].map((goal) => (
                        <GoalRow key={goal.id} goal={goal} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">{t("legend")}</p>
        </div>
      )}
    </div>
  );
}

function GoalRow({ goal }: { goal: TriageGoal }) {
  const locale = useLocale();
  const overdue = isGoalOverdue(goal);

  return (
    <li>
      <Link
        href={`/goals/${goal.id}`}
        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <span className="min-w-0 truncate text-slate-800 dark:text-slate-200">{goal.name}</span>
        {goal.targetDate && (
          <span
            className={clsx(
              "shrink-0 text-xs",
              overdue ? "font-medium text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
            )}
          >
            {formatDate(goal.targetDate, locale)}
          </span>
        )}
      </Link>
    </li>
  );
}

function UnscoredRow({ goal }: { goal: TriageGoal }) {
  const t = useTranslations("Triage");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(field: "effortScore" | "impactScore", value: string) {
    setPending(true);
    try {
      await api.updateGoal(goal.id, { [field]: value || null });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <Link
        href={`/goals/${goal.id}`}
        className="font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
      >
        {goal.name}
      </Link>
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          {t("effort")}
          <select
            defaultValue={goal.effortScore?.toString() ?? ""}
            onChange={(e) => handleChange("effortScore", e.target.value)}
            disabled={pending}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">{t("scoreUnset")}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          {t("impact")}
          <select
            defaultValue={goal.impactScore?.toString() ?? ""}
            onChange={(e) => handleChange("impactScore", e.target.value)}
            disabled={pending}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">{t("scoreUnset")}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </li>
  );
}
