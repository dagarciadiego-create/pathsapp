"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Link, useRouter } from "@/i18n/navigation";
import { StatCard } from "./ui/stat-card";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { DeadlineStatusBadge } from "./ui/status-badge";
import { DeadlineFormDialog } from "./deadline-form-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import { isDeadlineDueSoon, isDeadlineOverdue } from "@/lib/deadline-helpers";
import type { DeadlineWithGoal } from "@/lib/types";
import type { DeadlineKind, DeadlineStatus } from "@/lib/constants";

export function DeadlinesPage({
  initialDeadlines,
  goals,
}: {
  initialDeadlines: DeadlineWithGoal[];
  goals: { id: string; name: string }[];
}) {
  const t = useTranslations("Deadlines");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [dialog, setDialog] = useState<{ open: boolean; deadline?: DeadlineWithGoal | null }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<DeadlineWithGoal | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const stats = useMemo(() => {
    const open = initialDeadlines.filter((d) => d.status === "OPEN").length;
    const overdue = initialDeadlines.filter(isDeadlineOverdue).length;
    const next30 = initialDeadlines.filter((d) => isDeadlineDueSoon(d)).length;
    return { open, overdue, next30 };
  }, [initialDeadlines]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.deleteDeadline(deleting.id);
      router.refresh();
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setDialog({ open: true, deadline: null })}>
          <Plus className="h-4 w-4" />
          {t("newDeadline")}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t("summaryOpen")} value={stats.open} />
        <StatCard label={t("summaryNext30")} value={stats.next30} tone={stats.next30 > 0 ? "warning" : "default"} />
        <StatCard label={t("summaryOverdue")} value={stats.overdue} tone={stats.overdue > 0 ? "danger" : "default"} />
      </div>

      {initialDeadlines.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columnTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("columnKind")}</th>
                <th className="px-4 py-3 font-medium">{t("columnDue")}</th>
                <th className="px-4 py-3 font-medium">{t("columnGoal")}</th>
                <th className="px-4 py-3 font-medium">{t("columnStatus")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialDeadlines.map((deadline) => {
                const overdue = isDeadlineOverdue(deadline);
                return (
                  <tr key={deadline.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {deadline.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {tEnums(`deadlineKind.${deadline.kind as DeadlineKind}`)}
                    </td>
                    <td
                      className={clsx(
                        "px-4 py-3",
                        overdue ? "font-medium text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {formatDate(deadline.dueDate, locale)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {deadline.goal ? (
                        <Link
                          href={`/goals/${deadline.goal.id}`}
                          className="hover:text-teal-700 hover:underline dark:hover:text-teal-400"
                        >
                          {deadline.goal.name}
                        </Link>
                      ) : (
                        <span className="italic text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DeadlineStatusBadge
                        status={deadline.status as DeadlineStatus}
                        label={tEnums(`deadlineStatus.${deadline.status as DeadlineStatus}`)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDialog({ open: true, deadline })}
                          aria-label={tCommon("edit")}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(deadline)}
                          aria-label={tCommon("delete")}
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

      <DeadlineFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        goals={goals}
        deadline={dialog.deadline}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        pending={deletePending}
      />
    </div>
  );
}
