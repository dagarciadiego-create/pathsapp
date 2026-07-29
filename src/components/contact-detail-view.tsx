"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { Section } from "./ui/section";
import { ConfirmDialog } from "./ui/confirm-dialog";
import {
  ContactRelationBadge,
  StanceBadge,
  SubtaskStatusBadge,
  CommitmentStatusBadge,
} from "./ui/status-badge";
import { ActionTypeIcon } from "./ui/action-type-icon";
import { DirectoryContactFormDialog } from "./directory-contact-form-dialog";
import { InteractionFormDialog } from "./interaction-form-dialog";
import { CommitmentFormDialog } from "./commitment-form-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import { STANCE_VALUES } from "@/lib/constants";
import type { ContactDetail, CommitmentWithGoal } from "@/lib/types";
import type {
  ActionType,
  ContactRelation,
  Stance,
  SubtaskStatus,
  CommitmentStatus,
} from "@/lib/constants";

export function ContactDetailView({ contact }: { contact: ContactDetail }) {
  const t = useTranslations("ContactDetail");
  const tDir = useTranslations("ContactDirectory");
  const tCommon = useTranslations("Common");
  const tEnums = useTranslations("Enums");
  const locale = useLocale();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const [interactionDialog, setInteractionDialog] = useState<{
    open: boolean;
    interaction?: ContactDetail["interactions"][number] | null;
  }>({ open: false });
  const [deletingInteraction, setDeletingInteraction] = useState<
    ContactDetail["interactions"][number] | null
  >(null);
  const [interactionDeletePending, setInteractionDeletePending] = useState(false);

  const [commitmentDialog, setCommitmentDialog] = useState<{
    open: boolean;
    commitment?: CommitmentWithGoal | null;
  }>({ open: false });
  const [deletingCommitment, setDeletingCommitment] = useState<CommitmentWithGoal | null>(null);
  const [commitmentDeletePending, setCommitmentDeletePending] = useState(false);

  const goalOptions = useMemo(
    () => contact.goalLinks.map((gl) => gl.goal),
    [contact.goalLinks]
  );

  async function confirmDelete() {
    setDeletePending(true);
    try {
      await api.deleteContact(contact.id);
      router.push("/contacts");
    } finally {
      setDeletePending(false);
    }
  }

  async function confirmDeleteInteraction() {
    if (!deletingInteraction) return;
    setInteractionDeletePending(true);
    try {
      await api.deleteInteraction(deletingInteraction.id);
      router.refresh();
      setDeletingInteraction(null);
    } finally {
      setInteractionDeletePending(false);
    }
  }

  async function confirmDeleteCommitment() {
    if (!deletingCommitment) return;
    setCommitmentDeletePending(true);
    try {
      await api.deleteCommitment(deletingCommitment.id);
      router.refresh();
      setDeletingCommitment(null);
    } finally {
      setCommitmentDeletePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {tDir("title")}
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{contact.name}</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {tCommon("edit")}
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {tCommon("delete")}
            </Button>
          </div>
        </div>

        {(contact.organization || contact.role) && (
          <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Building2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {[contact.role, contact.organization].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-400"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-400"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {contact.phone}
            </a>
          )}
        </div>
        {contact.notes && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{contact.notes}</p>
        )}
      </div>

      <Section title={t("linkedGoalsTitle")} subtitle={t("linkedGoalsSubtitle")}>
        {contact.goalLinks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noLinkedGoals")}</p>
        ) : (
          <ul className="space-y-3">
            {contact.goalLinks.map((link) => (
              <GoalLinkRow key={link.id} link={link} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        title={t("interactionsTitle")}
        subtitle={t("interactionsSubtitle")}
        addLabel={t("logInteraction")}
        onAdd={() => setInteractionDialog({ open: true, interaction: null })}
      >
        {contact.interactions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noInteractions")}</p>
        ) : (
          <ul className="space-y-2">
            {contact.interactions.map((interaction) => (
              <li
                key={interaction.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <ActionTypeIcon type={interaction.actionType as ActionType} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {interaction.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{tEnums(`actionType.${interaction.actionType as ActionType}`)}</span>
                      {interaction.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {formatDate(interaction.dueDate, locale)}
                        </span>
                      )}
                    </div>
                    {interaction.notes && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {interaction.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SubtaskStatusBadge
                    status={interaction.status as SubtaskStatus}
                    label={tEnums(`subtaskStatus.${interaction.status as SubtaskStatus}`)}
                  />
                  <button
                    type="button"
                    onClick={() => setInteractionDialog({ open: true, interaction })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingInteraction(interaction)}
                    aria-label={tCommon("delete")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title={t("commitmentsTitle")}
        subtitle={t("commitmentsSubtitle")}
        addLabel={t("addCommitment")}
        onAdd={() => setCommitmentDialog({ open: true, commitment: null })}
      >
        {contact.commitments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noCommitments")}</p>
        ) : (
          <ul className="space-y-2">
            {contact.commitments.map((commitment) => (
              <li
                key={commitment.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {commitment.description}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{t("madeOn", { date: formatDate(commitment.madeDate, locale) ?? "" })}</span>
                    {commitment.followUpDate && (
                      <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {t("followUpOn", { date: formatDate(commitment.followUpDate, locale) ?? "" })}
                      </span>
                    )}
                    {commitment.goal && (
                      <Link
                        href={`/goals/${commitment.goal.id}`}
                        className="hover:text-teal-700 hover:underline dark:hover:text-teal-400"
                      >
                        {commitment.goal.name}
                      </Link>
                    )}
                  </div>
                  {commitment.notes && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {commitment.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CommitmentStatusBadge
                    status={commitment.status as CommitmentStatus}
                    label={tEnums(`commitmentStatus.${commitment.status as CommitmentStatus}`)}
                  />
                  <button
                    type="button"
                    onClick={() => setCommitmentDialog({ open: true, commitment })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCommitment(commitment)}
                    aria-label={tCommon("delete")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <DirectoryContactFormDialog open={editOpen} onClose={() => setEditOpen(false)} contact={contact} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        pending={deletePending}
        body={tDir("deleteConfirmBody")}
      />

      <InteractionFormDialog
        open={interactionDialog.open}
        onClose={() => setInteractionDialog({ open: false })}
        contactId={contact.id}
        goals={goalOptions}
        interaction={interactionDialog.interaction}
      />
      <ConfirmDialog
        open={!!deletingInteraction}
        onClose={() => setDeletingInteraction(null)}
        onConfirm={confirmDeleteInteraction}
        pending={interactionDeletePending}
      />

      <CommitmentFormDialog
        open={commitmentDialog.open}
        onClose={() => setCommitmentDialog({ open: false })}
        contactId={contact.id}
        goals={goalOptions}
        commitment={commitmentDialog.commitment}
      />
      <ConfirmDialog
        open={!!deletingCommitment}
        onClose={() => setDeletingCommitment(null)}
        onConfirm={confirmDeleteCommitment}
        pending={commitmentDeletePending}
      />
    </div>
  );
}

function GoalLinkRow({ link }: { link: ContactDetail["goalLinks"][number] }) {
  const t = useTranslations("ContactDetail");
  const tEnums = useTranslations("Enums");
  const locale = useLocale();
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stancePending, setStancePending] = useState(false);

  async function handleStanceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stance = e.target.value;
    if (!stance) return;
    setStancePending(true);
    try {
      await api.updateGoalContact(link.id, { stance });
      router.refresh();
    } finally {
      setStancePending(false);
    }
  }

  return (
    <li className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/goals/${link.goal.id}`}
            className="font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
          >
            {link.goal.name}
          </Link>
          <ContactRelationBadge
            relation={link.relation as ContactRelation}
            label={tEnums(`contactRelation.${link.relation as ContactRelation}`)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={link.stance ?? ""}
            onChange={handleStanceChange}
            disabled={stancePending}
            aria-label={t("stance")}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="" disabled>
              {t("stanceUnset")}
            </option>
            {STANCE_VALUES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`stance.${s}`)}
              </option>
            ))}
          </select>
          {link.stance && (
            <StanceBadge
              stance={link.stance as Stance}
              label={tEnums(`stance.${link.stance as Stance}`)}
            />
          )}
        </div>
      </div>
      {link.stanceHistory.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
          >
            {historyOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {t("stanceHistory", { count: link.stanceHistory.length })}
          </button>
          {historyOpen && (
            <ul className="mt-1.5 space-y-1 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
              {link.stanceHistory.map((change) => (
                <li key={change.id} className="text-xs text-slate-500 dark:text-slate-400">
                  <StanceBadge
                    stance={change.stance as Stance}
                    label={tEnums(`stance.${change.stance as Stance}`)}
                  />{" "}
                  · {formatDate(change.changedAt, locale)}
                  {change.note && <span> — {change.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
