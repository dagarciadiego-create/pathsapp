"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, GraduationCap, ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { GOAL_KINDS, GOAL_STATUSES } from "@/lib/constants";
import { isGoalOverdue } from "@/lib/goal-helpers";
import { api } from "@/lib/api-client";
import type { GoalListItem } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { GoalFormDialog } from "./goal-form-dialog";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Button, Input, Select } from "./ui/form";
import { StatCard } from "./ui/stat-card";

export function GoalsBoard({ initialGoals }: { initialGoals: GoalListItem[] }) {
  const t = useTranslations("Home");
  const tEnums = useTranslations("Enums");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalListItem | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalListItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const stats = useMemo(() => {
    const total = initialGoals.length;
    const achieved = initialGoals.filter((g) => g.status === "ACHIEVED").length;
    const inProgress = initialGoals.filter((g) => g.status === "IN_PROGRESS").length;
    const overdue = initialGoals.filter(isGoalOverdue).length;
    return { total, achieved, inProgress, overdue };
  }, [initialGoals]);

  const filteredGoals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialGoals.filter((g) => {
      if (kindFilter && g.kind !== kindFilter) return false;
      if (statusFilter && g.status !== statusFilter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.responsible.toLowerCase().includes(q) ||
        (g.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [initialGoals, query, kindFilter, statusFilter]);

  function openCreate() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  function openEdit(goal: GoalListItem) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingGoal) return;
    setDeletePending(true);
    try {
      await api.deleteGoal(deletingGoal.id);
      router.refresh();
      setDeletingGoal(null);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Workshop entry point. This app has no login screen, so the home
          board is the first thing a workshop participant sees — the banner
          is what makes the challenges findable from a cold start. */}
      <Link
        href="/workshop"
        className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 transition-colors hover:bg-teal-100 dark:border-teal-900/60 dark:bg-teal-900/30 dark:hover:bg-teal-900/50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-teal-900 dark:text-teal-100">
            {t("workshopBannerTitle")}
          </span>
          <span className="block text-sm text-teal-800/80 dark:text-teal-200/80">
            {t("workshopBannerBody")}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-teal-800 dark:text-teal-200">
          {t("workshopBannerCta")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("newGoal")}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("summaryTotal")} value={stats.total} />
        <StatCard label={t("summaryAchieved")} value={stats.achieved} tone="success" />
        <StatCard label={t("summaryInProgress")} value={stats.inProgress} />
        <StatCard label={t("summaryOverdue")} value={stats.overdue} tone="danger" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="w-auto">
          <option value="">{t("filterKindAll")}</option>
          {GOAL_KINDS.map((k) => (
            <option key={k} value={k}>
              {tEnums(`goalKind.${k}`)}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto"
        >
          <option value="">{t("filterStatusAll")}</option>
          {GOAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tEnums(`goalStatus.${s}`)}
            </option>
          ))}
        </Select>
      </div>

      {filteredGoals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {initialGoals.length === 0 ? t("emptyState") : t("emptyStateFiltered")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => openEdit(goal)}
              onDelete={() => setDeletingGoal(goal)}
            />
          ))}
        </div>
      )}

      <GoalFormDialog open={formOpen} onClose={() => setFormOpen(false)} goal={editingGoal} />
      <ConfirmDialog
        open={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={confirmDelete}
        pending={deletePending}
      />
    </div>
  );
}
