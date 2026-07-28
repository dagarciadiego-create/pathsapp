"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ProgressBar } from "./ui/progress-bar";
import { StatCard } from "./ui/stat-card";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { IndicatorFormDialog } from "./indicator-form-dialog";
import { api } from "@/lib/api-client";
import { formatIndicatorValue } from "@/lib/goal-helpers";
import type { IndicatorWithGoal } from "@/lib/types";

function percentOf(indicator: IndicatorWithGoal) {
  if (indicator.targetValue <= 0) return 0;
  return Math.round((indicator.currentValue / indicator.targetValue) * 100);
}

export function IndicatorsTable({
  initialIndicators,
  goals,
}: {
  initialIndicators: IndicatorWithGoal[];
  goals: { id: string; name: string }[];
}) {
  const t = useTranslations("Indicators");
  const locale = useLocale();
  const router = useRouter();

  const [dialog, setDialog] = useState<{ open: boolean; indicator?: IndicatorWithGoal | null }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<IndicatorWithGoal | null>(null);

  const stats = useMemo(() => {
    const total = initialIndicators.length;
    const achieved = initialIndicators.filter((i) => percentOf(i) >= 100).length;
    const overallAvg =
      total > 0
        ? Math.round(initialIndicators.reduce((sum, i) => sum + percentOf(i), 0) / total)
        : 0;
    return { total, achieved, overallAvg };
  }, [initialIndicators]);

  async function confirmDelete() {
    if (!deleting) return;
    await api.deleteIndicator(deleting.id);
    router.refresh();
    setDeleting(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setDialog({ open: true, indicator: null })}>
          <Plus className="h-4 w-4" />
          {t("newIndicator")}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t("columnName")} value={stats.total} />
        <StatCard label={t("overallProgress")} value={`${stats.overallAvg}%`} tone="success" />
        <StatCard label={t("achievedCount")} value={stats.achieved} />
      </div>

      {initialIndicators.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columnName")}</th>
                <th className="px-4 py-3 font-medium">{t("columnGoal")}</th>
                <th className="px-4 py-3 font-medium">{t("columnTarget")}</th>
                <th className="px-4 py-3 font-medium">{t("columnCurrent")}</th>
                <th className="px-4 py-3 font-medium">{t("columnProgress")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialIndicators.map((indicator) => {
                const percent = percentOf(indicator);
                return (
                  <tr key={indicator.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {indicator.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {indicator.goal ? (
                        <Link
                          href={`/goals/${indicator.goal.id}`}
                          className="hover:text-teal-700 hover:underline dark:hover:text-teal-400"
                        >
                          {indicator.goal.name}
                        </Link>
                      ) : (
                        <span className="italic text-slate-400 dark:text-slate-500">
                          {t("globalIndicator")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatIndicatorValue(indicator.targetValue, indicator.unit, locale)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatIndicatorValue(indicator.currentValue, indicator.unit, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar percent={percent} className="w-24" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDialog({ open: true, indicator })}
                          aria-label="Edit"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(indicator)}
                          aria-label="Delete"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <IndicatorFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        goals={goals}
        indicator={dialog.indicator}
      />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  );
}
