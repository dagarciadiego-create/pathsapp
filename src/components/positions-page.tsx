"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, UserRound, Building2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { PositionFormDialog } from "./position-form-dialog";
import { PositionHolderDialog } from "./position-holder-dialog";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/goal-helpers";
import type { Position, PositionHolderWithContact } from "@/lib/types";

type PositionWithHolders = Position & { holders: PositionHolderWithContact[] };

export function PositionsPage({
  positions,
  contacts,
}: {
  positions: PositionWithHolders[];
  contacts: { id: string; name: string }[];
}) {
  const t = useTranslations("Positions");
  const router = useRouter();

  const [positionDialog, setPositionDialog] = useState<{ open: boolean; position?: Position | null }>({
    open: false,
  });
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  async function confirmDeletePosition() {
    if (!deletingPosition) return;
    setDeletePending(true);
    try {
      await api.deletePosition(deletingPosition.id);
      router.refresh();
      setDeletingPosition(null);
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
        <Button onClick={() => setPositionDialog({ open: true, position: null })}>
          <Plus className="h-4 w-4" />
          {t("newPosition")}
        </Button>
      </div>

      {positions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("emptyState")}
        </p>
      ) : (
        <ul className="space-y-3">
          {positions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              contacts={contacts}
              onEdit={() => setPositionDialog({ open: true, position })}
              onDelete={() => setDeletingPosition(position)}
            />
          ))}
        </ul>
      )}

      <PositionFormDialog
        open={positionDialog.open}
        onClose={() => setPositionDialog({ open: false })}
        position={positionDialog.position}
      />
      <ConfirmDialog
        open={!!deletingPosition}
        onClose={() => setDeletingPosition(null)}
        onConfirm={confirmDeletePosition}
        pending={deletePending}
        body={t("deleteConfirmBody")}
      />
    </div>
  );
}

function PositionCard({
  position,
  contacts,
  onEdit,
  onDelete,
}: {
  position: PositionWithHolders;
  contacts: { id: string; name: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Positions");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [holderDialog, setHolderDialog] = useState<{
    open: boolean;
    holder?: PositionHolderWithContact | null;
  }>({ open: false });
  const [deletingHolder, setDeletingHolder] = useState<PositionHolderWithContact | null>(null);
  const [holderDeletePending, setHolderDeletePending] = useState(false);

  const current = position.holders.find((h) => !h.endDate) ?? null;
  const history = position.holders.filter((h) => h.id !== current?.id);

  async function confirmDeleteHolder() {
    if (!deletingHolder) return;
    setHolderDeletePending(true);
    try {
      await api.deletePositionHolder(deletingHolder.id);
      router.refresh();
      setDeletingHolder(null);
    } finally {
      setHolderDeletePending(false);
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{position.title}</p>
          {position.organization && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              {position.organization}
            </p>
          )}
          {position.notes && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{position.notes}</p>
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <UserRound className="h-4 w-4" aria-hidden />
          </span>
          {current ? (
            <div>
              <Link
                href={`/contacts/${current.contact.id}`}
                className="font-medium text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
              >
                {current.contact.name}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("since", { date: formatDate(current.startDate, locale) ?? "" })}
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium italic text-slate-500 dark:text-slate-400">
              {t("vacant")}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {current && (
            <button
              type="button"
              onClick={() => setHolderDialog({ open: true, holder: current })}
              aria-label={t("editCurrentHolder")}
              title={t("editCurrentHolder")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <Button variant="secondary" onClick={() => setHolderDialog({ open: true, holder: null })}>
            {current ? t("changeHolder") : t("assignHolder")}
          </Button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
          >
            {historyOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {t("history", { count: history.length })}
          </button>
          {historyOpen && (
            <ul className="mt-1.5 space-y-1.5 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
              {history.map((holder) => (
                <li
                  key={holder.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span>
                    <Link
                      href={`/contacts/${holder.contact.id}`}
                      className="font-medium hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      {holder.contact.name}
                    </Link>{" "}
                    · {formatDate(holder.startDate, locale)} – {formatDate(holder.endDate, locale)}
                    {holder.notes && <span className="text-slate-400"> — {holder.notes}</span>}
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setHolderDialog({ open: true, holder })}
                      aria-label={tCommon("edit")}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingHolder(holder)}
                      aria-label={tCommon("delete")}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <PositionHolderDialog
        open={holderDialog.open}
        onClose={() => setHolderDialog({ open: false })}
        positionId={position.id}
        contacts={contacts}
        holder={holderDialog.holder}
      />
      <ConfirmDialog
        open={!!deletingHolder}
        onClose={() => setDeletingHolder(null)}
        onConfirm={confirmDeleteHolder}
        pending={holderDeletePending}
      />
    </li>
  );
}
