"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ProgressBar } from "./ui/progress-bar";
import { formatIndicatorValue, percentOf } from "@/lib/goal-helpers";
import type { Indicator } from "@/lib/types";

export function IndicatorList({
  indicators,
  onEdit,
  onDelete,
}: {
  indicators: Indicator[];
  onEdit: (indicator: Indicator) => void;
  onDelete: (indicator: Indicator) => void;
}) {
  const locale = useLocale();
  const tCommon = useTranslations("Common");

  return (
    <ul className="space-y-3">
      {indicators.map((indicator) => (
        <li
          key={indicator.id}
          className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <p className="font-medium text-slate-900 dark:text-slate-100">{indicator.name}</p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(indicator)}
                aria-label={tCommon("edit")}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(indicator)}
                aria-label={tCommon("delete")}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ProgressBar percent={percentOf(indicator)} className="mb-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatIndicatorValue(indicator.currentValue, indicator.unit, locale)} /{" "}
            {formatIndicatorValue(indicator.targetValue, indicator.unit, locale)} (
            {percentOf(indicator)}%)
          </p>
        </li>
      ))}
    </ul>
  );
}
