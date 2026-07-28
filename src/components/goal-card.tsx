"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2, User, CalendarDays, Users, Gauge, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GoalStatusBadge } from "./ui/status-badge";
import { ProgressBar } from "./ui/progress-bar";
import { clsx } from "clsx";
import { computeGoalProgress, formatDate, isGoalOverdue } from "@/lib/goal-helpers";
import type { GoalListItem } from "@/lib/types";
import type { GoalKind, GoalStatus } from "@/lib/constants";

export function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: GoalListItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Home");
  const tEnums = useTranslations("Enums");
  const locale = useLocale();

  const { done, total, percent } = computeGoalProgress(goal.subtasks);
  const overdue = isGoalOverdue(goal);
  const dateLabel = formatDate(goal.targetDate, locale);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            goal.kind === "OUTCOME"
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
              : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300"
          )}
        >
          {tEnums(`goalKind.${goal.kind as GoalKind}`)}
        </span>
        <GoalStatusBadge
          status={goal.status as GoalStatus}
          label={tEnums(`goalStatus.${goal.status as GoalStatus}`)}
        />
      </div>

      <Link
        href={`/goals/${goal.id}`}
        className="mb-1 text-base font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
      >
        {goal.name}
      </Link>

      {goal.category && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {goal.category}
        </p>
      )}

      <div className="mb-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        <p className="flex items-center gap-1.5">
          <User className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          {goal.responsible}
        </p>
        <p
          className={clsx(
            "flex items-center gap-1.5",
            overdue && "font-medium text-rose-600 dark:text-rose-400"
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          {dateLabel ?? t("noTargetDate")}
        </p>
        <p className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {goal._count.goalContacts}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {goal._count.indicators}
          </span>
        </p>
      </div>

      <div className="mb-3">
        {total > 0 ? (
          <>
            <ProgressBar percent={percent ?? 0} className="mb-1" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("subtasksDone", { done, total })}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">{t("noSubtasks")}</p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <Link
          href={`/goals/${goal.id}`}
          className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          {t("viewDetails")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
