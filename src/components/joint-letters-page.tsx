"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ExternalLink, Users } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { CosignerStatusBadge } from "./ui/status-badge";
import { JointLetterFormDialog } from "./joint-letter-form-dialog";
import { CosignerFormDialog } from "./cosigner-form-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import { COSIGNER_STATUSES } from "@/lib/constants";
import type { CosignerStatus } from "@/lib/constants";
import type { JointLetterCosigner, JointLetterWithGoalAndCosigners } from "@/lib/types";

export function JointLettersPage({
  jointLetters,
  goals,
}: {
  jointLetters: JointLetterWithGoalAndCosigners[];
  goals: { id: string; name: string }[];
}) {
  const t = useTranslations("JointLetters");

  const [letterDialog, setLetterDialog] = useState<{
    open: boolean;
    jointLetter?: JointLetterWithGoalAndCosigners | null;
  }>({ open: false });
  const [deletingLetter, setDeletingLetter] = useState<JointLetterWithGoalAndCosigners | null>(
    null
  );
  const [deletePending, setDeletePending] = useState(false);
  const router = useRouter();

  async function confirmDeleteLetter() {
    if (!deletingLetter) return;
    setDeletePending(true);
    try {
      await api.deleteJointLetter(deletingLetter.id);
      router.refresh();
      setDeletingLetter(null);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setLetterDialog({ open: true, jointLetter: null })}>
          <Plus className="h-4 w-4" />
          {t("newLetter")}
        </Button>
      </div>

      {jointLetters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <ul className="space-y-4">
          {jointLetters.map((letter) => (
            <JointLetterCard
              key={letter.id}
              letter={letter}
              onEdit={() => setLetterDialog({ open: true, jointLetter: letter })}
              onDelete={() => setDeletingLetter(letter)}
            />
          ))}
        </ul>
      )}

      <JointLetterFormDialog
        open={letterDialog.open}
        onClose={() => setLetterDialog({ open: false })}
        goals={goals}
        jointLetter={letterDialog.jointLetter}
      />
      <ConfirmDialog
        open={!!deletingLetter}
        onClose={() => setDeletingLetter(null)}
        onConfirm={confirmDeleteLetter}
        pending={deletePending}
        body={t("deleteConfirmBody")}
      />
    </div>
  );
}

function JointLetterCard({
  letter,
  onEdit,
  onDelete,
}: {
  letter: JointLetterWithGoalAndCosigners;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("JointLetters");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [cosignerDialog, setCosignerDialog] = useState<{
    open: boolean;
    cosigner?: JointLetterCosigner | null;
  }>({ open: false });
  const [deletingCosigner, setDeletingCosigner] = useState<JointLetterCosigner | null>(null);
  const [cosignerDeletePending, setCosignerDeletePending] = useState(false);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const tally: Record<CosignerStatus, number> = {
      INVITED: 0,
      CONFIRMED: 0,
      DECLINED: 0,
      SIGNED: 0,
    };
    for (const c of letter.cosigners) tally[c.status as CosignerStatus]++;
    return tally;
  }, [letter.cosigners]);

  async function handleStatusChange(cosignerId: string, status: string) {
    setStatusPendingId(cosignerId);
    try {
      await api.updateCosigner(cosignerId, { status });
      router.refresh();
    } finally {
      setStatusPendingId(null);
    }
  }

  async function confirmDeleteCosigner() {
    if (!deletingCosigner) return;
    setCosignerDeletePending(true);
    try {
      await api.deleteCosigner(deletingCosigner.id);
      router.refresh();
      setDeletingCosigner(null);
    } finally {
      setCosignerDeletePending(false);
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{letter.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            {letter.targetName && <span>{t("addressedTo", { target: letter.targetName })}</span>}
            {letter.sentDate && <span>{formatDate(letter.sentDate, locale)}</span>}
            {letter.goal && (
              <Link
                href={`/goals/${letter.goal.id}`}
                className="hover:text-teal-700 hover:underline dark:hover:text-teal-400"
              >
                {letter.goal.name}
              </Link>
            )}
            {letter.url && (
              <a
                href={letter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-teal-700 hover:underline dark:hover:text-teal-400"
              >
                {t("viewLetter")}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </div>
          {letter.notes && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{letter.notes}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={tCommon("edit")}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={tCommon("delete")}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("cosignersTitle", { count: letter.cosigners.length })}
          </h3>
          <Button variant="secondary" onClick={() => setCosignerDialog({ open: true, cosigner: null })}>
            <Plus className="h-4 w-4" />
            {t("addCosigner")}
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {COSIGNER_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <span key={s}>
              {counts[s]} {tEnums(`cosignerStatus.${s}`).toLowerCase()}
            </span>
          ))}
        </div>
        {letter.cosigners.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noCosigners")}</p>
        ) : (
          <ul className="space-y-1.5">
            {letter.cosigners.map((cosigner) => (
              <li
                key={cosigner.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {cosigner.organization}
                  </p>
                  {cosigner.contactName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cosigner.contactName}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={cosigner.status}
                    onChange={(e) => handleStatusChange(cosigner.id, e.target.value)}
                    disabled={statusPendingId === cosigner.id}
                    aria-label={t("cosignerStatus")}
                    className="rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {COSIGNER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {tEnums(`cosignerStatus.${s}`)}
                      </option>
                    ))}
                  </select>
                  <CosignerStatusBadge
                    status={cosigner.status as CosignerStatus}
                    label={tEnums(`cosignerStatus.${cosigner.status as CosignerStatus}`)}
                  />
                  <button
                    type="button"
                    onClick={() => setCosignerDialog({ open: true, cosigner })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCosigner(cosigner)}
                    aria-label={tCommon("delete")}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CosignerFormDialog
        open={cosignerDialog.open}
        onClose={() => setCosignerDialog({ open: false })}
        jointLetterId={letter.id}
        cosigner={cosignerDialog.cosigner}
      />
      <ConfirmDialog
        open={!!deletingCosigner}
        onClose={() => setDeletingCosigner(null)}
        onConfirm={confirmDeleteCosigner}
        pending={cosignerDeletePending}
      />
    </li>
  );
}
