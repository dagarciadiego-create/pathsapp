"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { StatCard } from "./ui/stat-card";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { MediaToneBadge } from "./ui/status-badge";
import { MediaCoverageFormDialog } from "./media-coverage-form-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import type { MediaCoverageWithGoal } from "@/lib/types";
import type { MediaTone } from "@/lib/constants";

export function MediaCoveragePage({
  initialItems,
  goals,
}: {
  initialItems: MediaCoverageWithGoal[];
  goals: { id: string; name: string }[];
}) {
  const t = useTranslations("MediaCoverage");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [dialog, setDialog] = useState<{ open: boolean; item?: MediaCoverageWithGoal | null }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<MediaCoverageWithGoal | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const stats = useMemo(() => {
    const positive = initialItems.filter((i) => i.tone === "POSITIVE").length;
    const negative = initialItems.filter((i) => i.tone === "NEGATIVE").length;
    return { total: initialItems.length, positive, negative };
  }, [initialItems]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.deleteMediaCoverage(deleting.id);
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
        <Button onClick={() => setDialog({ open: true, item: null })}>
          <Plus className="h-4 w-4" />
          {t("newEntry")}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t("summaryTotal")} value={stats.total} />
        <StatCard label={t("summaryPositive")} value={stats.positive} tone="success" />
        <StatCard label={t("summaryNegative")} value={stats.negative} tone={stats.negative > 0 ? "danger" : "default"} />
      </div>

      {initialItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columnDate")}</th>
                <th className="px-4 py-3 font-medium">{t("columnOutlet")}</th>
                <th className="px-4 py-3 font-medium">{t("columnTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("columnGoal")}</th>
                <th className="px-4 py-3 font-medium">{t("columnTone")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialItems.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                    {formatDate(item.publishedDate, locale)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {item.outlet}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-teal-700 hover:underline dark:hover:text-teal-400"
                      >
                        {item.title}
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      </a>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.goal ? (
                      <Link
                        href={`/goals/${item.goal.id}`}
                        className="hover:text-teal-700 hover:underline dark:hover:text-teal-400"
                      >
                        {item.goal.name}
                      </Link>
                    ) : (
                      <span className="italic text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <MediaToneBadge
                      tone={item.tone as MediaTone}
                      label={tEnums(`mediaTone.${item.tone as MediaTone}`)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDialog({ open: true, item })}
                        aria-label={tCommon("edit")}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(item)}
                        aria-label={tCommon("delete")}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MediaCoverageFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        goals={goals}
        item={dialog.item}
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
