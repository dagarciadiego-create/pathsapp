"use client";

import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2, CalendarDays, User, Paperclip } from "lucide-react";
import { clsx } from "clsx";
import { ActionTypeIcon } from "./ui/action-type-icon";
import { SubtaskStatusBadge } from "./ui/status-badge";
import { formatDate } from "@/lib/goal-helpers";
import type { SubtaskWithAttachments } from "@/lib/types";
import type { ActionType, SubtaskStatus } from "@/lib/constants";

export function SubtaskList({
  subtasks,
  onEdit,
  onDelete,
}: {
  subtasks: SubtaskWithAttachments[];
  onEdit: (subtask: SubtaskWithAttachments) => void;
  onDelete: (subtask: SubtaskWithAttachments) => void;
}) {
  const tEnums = useTranslations("Enums");
  const t = useTranslations("GoalDetail");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  if (subtasks.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("noSubtasks")}</p>;
  }

  return (
    <ul className="space-y-2">
      {subtasks.map((subtask) => (
        <li
          key={subtask.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <div className="flex min-w-0 flex-1 gap-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <ActionTypeIcon type={subtask.actionType as ActionType} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100">{subtask.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{tEnums(`actionType.${subtask.actionType as ActionType}`)}</span>
                <span
                  className={clsx(
                    "font-medium",
                    !subtask.isPlanned && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {tEnums(`planned.${subtask.isPlanned}`)}
                </span>
                {subtask.dueDate && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                    {formatDate(subtask.dueDate, locale)}
                  </span>
                )}
                {subtask.responsible && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" aria-hidden />
                    {subtask.responsible}
                  </span>
                )}
                {subtask.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" aria-hidden />
                    {subtask.attachments.length}
                  </span>
                )}
              </div>
              {subtask.notes && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtask.notes}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SubtaskStatusBadge
              status={subtask.status as SubtaskStatus}
              label={tEnums(`subtaskStatus.${subtask.status as SubtaskStatus}`)}
            />
            <button
              type="button"
              onClick={() => onEdit(subtask)}
              aria-label={tCommon("edit")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(subtask)}
              aria-label={tCommon("delete")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
