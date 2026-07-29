"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { PetitionFormDialog } from "./petition-form-dialog";
import { PetitionVersionDialog } from "./petition-version-dialog";
import { EvidenceFormDialog } from "./evidence-form-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import type { Evidence, Petition, PetitionVersion } from "@/lib/types";

type PetitionWithDetail = Petition & { versions: PetitionVersion[]; evidence: Evidence[] };

export function PetitionsPage({ petitions }: { petitions: PetitionWithDetail[] }) {
  const t = useTranslations("Petitions");

  const [petitionDialog, setPetitionDialog] = useState<{
    open: boolean;
    petition?: Petition | null;
  }>({ open: false });
  const [deletingPetition, setDeletingPetition] = useState<Petition | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const router = useRouter();

  async function confirmDeletePetition() {
    if (!deletingPetition) return;
    setDeletePending(true);
    try {
      await api.deletePetition(deletingPetition.id);
      router.refresh();
      setDeletingPetition(null);
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
        <Button onClick={() => setPetitionDialog({ open: true, petition: null })}>
          <Plus className="h-4 w-4" />
          {t("newPetition")}
        </Button>
      </div>

      {petitions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <ul className="space-y-4">
          {petitions.map((petition) => (
            <PetitionCard
              key={petition.id}
              petition={petition}
              onEdit={() => setPetitionDialog({ open: true, petition })}
              onDelete={() => setDeletingPetition(petition)}
            />
          ))}
        </ul>
      )}

      <PetitionFormDialog
        open={petitionDialog.open}
        onClose={() => setPetitionDialog({ open: false })}
        petition={petitionDialog.petition}
      />
      <ConfirmDialog
        open={!!deletingPetition}
        onClose={() => setDeletingPetition(null)}
        onConfirm={confirmDeletePetition}
        pending={deletePending}
        body={t("deleteConfirmBody")}
      />
    </div>
  );
}

function PetitionCard({
  petition,
  onEdit,
  onDelete,
}: {
  petition: PetitionWithDetail;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Petitions");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [deletingVersion, setDeletingVersion] = useState<PetitionVersion | null>(null);
  const [versionDeletePending, setVersionDeletePending] = useState(false);
  const [evidenceDialog, setEvidenceDialog] = useState<{
    open: boolean;
    evidence?: Evidence | null;
  }>({ open: false });
  const [deletingEvidence, setDeletingEvidence] = useState<Evidence | null>(null);
  const [evidenceDeletePending, setEvidenceDeletePending] = useState(false);

  // versions are fetched ordered by createdAt desc, so [0] is current.
  const current = petition.versions[0] ?? null;
  const history = petition.versions.slice(1);

  async function confirmDeleteVersion() {
    if (!deletingVersion) return;
    setVersionDeletePending(true);
    try {
      await api.deletePetitionVersion(deletingVersion.id);
      router.refresh();
      setDeletingVersion(null);
    } finally {
      setVersionDeletePending(false);
    }
  }

  async function confirmDeleteEvidence() {
    if (!deletingEvidence) return;
    setEvidenceDeletePending(true);
    try {
      await api.deleteEvidence(deletingEvidence.id);
      router.refresh();
      setDeletingEvidence(null);
    } finally {
      setEvidenceDeletePending(false);
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{petition.title}</p>
          {petition.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {petition.category}
            </p>
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

      <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
        {current ? (
          <>
            <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
              {current.contentEs}
            </p>
            {current.contentEn && (
              <p className="mt-2 whitespace-pre-wrap border-t border-slate-200 pt-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {current.contentEn}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {t("versionDate", { date: formatDate(current.createdAt, locale) ?? "" })}
              {current.notes && <span> — {current.notes}</span>}
            </p>
          </>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">{t("noVersions")}</p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        {history.length > 0 ? (
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
          >
            {historyOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {t("history", { count: history.length })}
          </button>
        ) : (
          <span />
        )}
        <Button variant="secondary" onClick={() => setVersionDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("addVersion")}
        </Button>
      </div>

      {historyOpen && (
        <ul className="mt-2 space-y-2 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
          {history.map((version) => (
            <li key={version.id} className="text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap">{version.contentEs}</p>
                <button
                  type="button"
                  onClick={() => setDeletingVersion(version)}
                  aria-label={tCommon("delete")}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-0.5 text-slate-400 dark:text-slate-500">
                {formatDate(version.createdAt, locale)}
                {version.notes && <span> — {version.notes}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("evidenceTitle", { count: petition.evidence.length })}
          </h3>
          <Button
            variant="secondary"
            onClick={() => setEvidenceDialog({ open: true, evidence: null })}
          >
            <Plus className="h-4 w-4" />
            {t("addEvidence")}
          </Button>
        </div>
        {petition.evidence.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("noEvidence")}</p>
        ) : (
          <ul className="space-y-1.5">
            {petition.evidence.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <div className="flex min-w-0 gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <div className="min-w-0">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-teal-700 hover:underline dark:text-slate-200 dark:hover:text-teal-400"
                      >
                        {item.title}
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                    )}
                    {item.source && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.source}</p>
                    )}
                    {item.summary && (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEvidenceDialog({ open: true, evidence: item })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingEvidence(item)}
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

      <PetitionVersionDialog
        open={versionDialogOpen}
        onClose={() => setVersionDialogOpen(false)}
        petitionId={petition.id}
      />
      <ConfirmDialog
        open={!!deletingVersion}
        onClose={() => setDeletingVersion(null)}
        onConfirm={confirmDeleteVersion}
        pending={versionDeletePending}
      />
      <EvidenceFormDialog
        open={evidenceDialog.open}
        onClose={() => setEvidenceDialog({ open: false })}
        petitionId={petition.id}
        evidence={evidenceDialog.evidence}
      />
      <ConfirmDialog
        open={!!deletingEvidence}
        onClose={() => setDeletingEvidence(null)}
        onConfirm={confirmDeleteEvidence}
        pending={evidenceDeletePending}
      />
    </li>
  );
}
