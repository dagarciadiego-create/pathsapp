"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2, User, CalendarDays, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { Link, useRouter } from "@/i18n/navigation";
import { GoalStatusBadge } from "./ui/status-badge";
import { ProgressBar } from "./ui/progress-bar";
import { Button } from "./ui/form";
import { Section } from "./ui/section";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { GoalFormDialog } from "./goal-form-dialog";
import { ContactList } from "./contact-list";
import { ContactFormDialog } from "./contact-form-dialog";
import { SubtaskList } from "./subtask-list";
import { SubtaskFormDialog } from "./subtask-form-dialog";
import { IndicatorList } from "./indicator-list";
import { IndicatorFormDialog } from "./indicator-form-dialog";
import { api } from "@/lib/api-client";
import { computeGoalProgress, formatDate, isGoalOverdue } from "@/lib/goal-helpers";
import type {
  GoalDetail,
  Contact,
  GoalContactWithContact,
  SubtaskWithAttachments,
  Indicator,
} from "@/lib/types";
import type { GoalKind, GoalStatus } from "@/lib/constants";

type SubtaskFilter = "ALL" | "PLANNED" | "UNPLANNED";

export function GoalDetailView({
  goal,
  directoryContacts,
}: {
  goal: GoalDetail;
  directoryContacts: Contact[];
}) {
  const t = useTranslations("GoalDetail");
  const tHome = useTranslations("Home");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const [contactDialog, setContactDialog] = useState<{
    open: boolean;
    goalContact?: GoalContactWithContact | null;
  }>({ open: false });
  const [unlinkingContact, setUnlinkingContact] = useState<GoalContactWithContact | null>(null);
  const [unlinkPending, setUnlinkPending] = useState(false);
  const linkedContactIds = useMemo(
    () => new Set(goal.goalContacts.map((gc) => gc.contactId)),
    [goal.goalContacts]
  );
  const availableContacts = useMemo(
    () => directoryContacts.filter((c) => !linkedContactIds.has(c.id)),
    [directoryContacts, linkedContactIds]
  );

  const [subtaskDialog, setSubtaskDialog] = useState<{
    open: boolean;
    subtask?: SubtaskWithAttachments | null;
  }>({ open: false });
  const [deletingSubtask, setDeletingSubtask] = useState<SubtaskWithAttachments | null>(null);
  const [subtaskDeletePending, setSubtaskDeletePending] = useState(false);
  const [subtaskFilter, setSubtaskFilter] = useState<SubtaskFilter>("ALL");

  const [indicatorDialog, setIndicatorDialog] = useState<{
    open: boolean;
    indicator?: Indicator | null;
  }>({ open: false });
  const [deletingIndicator, setDeletingIndicator] = useState<Indicator | null>(null);
  const [indicatorDeletePending, setIndicatorDeletePending] = useState(false);

  const { done, total, percent } = computeGoalProgress(goal.subtasks);
  const overdue = isGoalOverdue(goal);
  const dateLabel = formatDate(goal.targetDate, locale);

  const filteredSubtasks = useMemo(() => {
    if (subtaskFilter === "PLANNED") return goal.subtasks.filter((s) => s.isPlanned);
    if (subtaskFilter === "UNPLANNED") return goal.subtasks.filter((s) => !s.isPlanned);
    return goal.subtasks;
  }, [goal.subtasks, subtaskFilter]);

  async function confirmDeleteGoal() {
    setDeletePending(true);
    try {
      await api.deleteGoal(goal.id);
      router.push("/");
    } finally {
      setDeletePending(false);
    }
  }

  async function confirmUnlinkContact() {
    if (!unlinkingContact) return;
    setUnlinkPending(true);
    try {
      await api.unlinkContact(unlinkingContact.id);
      router.refresh();
      setUnlinkingContact(null);
    } finally {
      setUnlinkPending(false);
    }
  }

  async function confirmDeleteSubtask() {
    if (!deletingSubtask) return;
    setSubtaskDeletePending(true);
    try {
      await api.deleteSubtask(deletingSubtask.id);
      router.refresh();
      setDeletingSubtask(null);
    } finally {
      setSubtaskDeletePending(false);
    }
  }

  async function confirmDeleteIndicator() {
    if (!deletingIndicator) return;
    setIndicatorDeletePending(true);
    try {
      await api.deleteIndicator(deletingIndicator.id);
      router.refresh();
      setDeletingIndicator(null);
    } finally {
      setIndicatorDeletePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("backToList")}
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
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
            {goal.category && (
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {goal.category}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditGoalOpen(true)}>
              <Pencil className="h-4 w-4" />
              {tCommon("edit")}
            </Button>
            <Button variant="danger" onClick={() => setDeleteGoalOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t("deleteGoal")}
            </Button>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{goal.name}</h1>
        {goal.description && (
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>
        )}

        <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-400" aria-hidden />
            {goal.responsible}
          </span>
          <span
            className={clsx(
              "flex items-center gap-1.5",
              overdue && "font-medium text-rose-600 dark:text-rose-400"
            )}
          >
            <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
            {dateLabel ?? tHome("noTargetDate")}
          </span>
        </div>

        {total > 0 ? (
          <>
            <ProgressBar percent={percent ?? 0} className="mb-1" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tHome("subtasksDone", { done, total })}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">{tHome("noSubtasks")}</p>
        )}
      </div>

      <Section
        title={t("contactsTitle")}
        subtitle={t("contactsSubtitle")}
        addLabel={t("addContact")}
        onAdd={() => setContactDialog({ open: true, goalContact: null })}
      >
        <ContactList
          goalContacts={goal.goalContacts}
          onEdit={(goalContact) => setContactDialog({ open: true, goalContact })}
          onUnlink={setUnlinkingContact}
        />
      </Section>

      <Section
        title={t("subtasksTitle")}
        subtitle={t("subtasksSubtitle")}
        addLabel={t("addSubtask")}
        onAdd={() => setSubtaskDialog({ open: true, subtask: null })}
      >
        <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {(["ALL", "PLANNED", "UNPLANNED"] as SubtaskFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSubtaskFilter(filter)}
              className={clsx(
                "flex-1 rounded-md px-2 py-1.5 font-medium transition-colors",
                subtaskFilter === filter
                  ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {filter === "ALL"
                ? t("filterAllActions")
                : filter === "PLANNED"
                  ? t("filterPlanned")
                  : t("filterUnplanned")}
            </button>
          ))}
        </div>
        <SubtaskList
          subtasks={filteredSubtasks}
          onEdit={(subtask) => setSubtaskDialog({ open: true, subtask })}
          onDelete={setDeletingSubtask}
        />
      </Section>

      <Section
        title={t("indicatorsTitle")}
        addLabel={t("addIndicator")}
        onAdd={() => setIndicatorDialog({ open: true, indicator: null })}
      >
        {goal.indicators.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tCommon("noResults")}
          </p>
        ) : (
          <IndicatorList
            indicators={goal.indicators}
            onEdit={(indicator) => setIndicatorDialog({ open: true, indicator })}
            onDelete={setDeletingIndicator}
          />
        )}
      </Section>

      <GoalFormDialog open={editGoalOpen} onClose={() => setEditGoalOpen(false)} goal={goal} />
      <ConfirmDialog
        open={deleteGoalOpen}
        onClose={() => setDeleteGoalOpen(false)}
        onConfirm={confirmDeleteGoal}
        pending={deletePending}
      />

      <ContactFormDialog
        open={contactDialog.open}
        onClose={() => setContactDialog({ open: false })}
        goalId={goal.id}
        availableContacts={availableContacts}
        goalContact={contactDialog.goalContact}
      />
      <ConfirmDialog
        open={!!unlinkingContact}
        onClose={() => setUnlinkingContact(null)}
        onConfirm={confirmUnlinkContact}
        pending={unlinkPending}
        title={t("unlinkConfirmTitle")}
        body={t("unlinkConfirmBody")}
      />

      <SubtaskFormDialog
        open={subtaskDialog.open}
        onClose={() => setSubtaskDialog({ open: false })}
        goalId={goal.id}
        subtask={subtaskDialog.subtask}
      />
      <ConfirmDialog
        open={!!deletingSubtask}
        onClose={() => setDeletingSubtask(null)}
        onConfirm={confirmDeleteSubtask}
        pending={subtaskDeletePending}
      />

      <IndicatorFormDialog
        open={indicatorDialog.open}
        onClose={() => setIndicatorDialog({ open: false })}
        goals={[]}
        fixedGoalId={goal.id}
        indicator={
          indicatorDialog.indicator
            ? { ...indicatorDialog.indicator, goal: { id: goal.id, name: goal.name } }
            : null
        }
      />
      <ConfirmDialog
        open={!!deletingIndicator}
        onClose={() => setDeletingIndicator(null)}
        onConfirm={confirmDeleteIndicator}
        pending={indicatorDeletePending}
      />
    </div>
  );
}
