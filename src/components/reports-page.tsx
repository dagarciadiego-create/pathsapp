"use client";

import { useLocale, useTranslations } from "next-intl";
import { FileText, FileSpreadsheet } from "lucide-react";
import { StatCard } from "./ui/stat-card";

export function ReportsPage({
  summary,
}: {
  summary: { total: number; achieved: number; inProgress: number };
}) {
  const t = useTranslations("Reports");
  const tHome = useTranslations("Home");
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label={tHome("summaryTotal")} value={summary.total} />
        <StatCard label={tHome("summaryAchieved")} value={summary.achieved} tone="success" />
        <StatCard label={tHome("summaryInProgress")} value={summary.inProgress} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href={`/api/reports/pdf?locale=${locale}`}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-slate-900 dark:text-slate-100">
              {t("downloadPdf")}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">PDF</span>
          </span>
        </a>

        <a
          href={`/api/reports/excel?locale=${locale}`}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <FileSpreadsheet className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-slate-900 dark:text-slate-100">
              {t("downloadExcel")}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">XLSX</span>
          </span>
        </a>
      </div>
    </div>
  );
}
