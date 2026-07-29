"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Mail, Phone, BadgeCheck, Tags } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button, Input } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { SpokespersonFormDialog } from "./spokesperson-form-dialog";
import { api } from "@/lib/api-client";
import type { Spokesperson } from "@/lib/types";

export function SpokespeoplePage({ initialSpokespeople }: { initialSpokespeople: Spokesperson[] }) {
  const t = useTranslations("Spokespeople");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; spokesperson?: Spokesperson | null }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<Spokesperson | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialSpokespeople;
    return initialSpokespeople.filter((s) =>
      [s.name, s.role, s.topics].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [initialSpokespeople, query]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.deleteSpokesperson(deleting.id);
      router.refresh();
      setDeleting(null);
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
        <Button onClick={() => setDialog({ open: true, spokesperson: null })}>
          <Plus className="h-4 w-4" />
          {t("newSpokesperson")}
        </Button>
      </div>

      <div className="mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {initialSpokespeople.length === 0 ? t("emptyState") : t("emptyStateFiltered")}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((sp) => (
            <li
              key={sp.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{sp.name}</p>
                    {sp.mediaTrained && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                        {t("mediaTrainedBadge")}
                      </span>
                    )}
                  </div>
                  {sp.role && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{sp.role}</p>
                  )}
                  {sp.topics && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Tags className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {sp.topics}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {sp.email && (
                      <a
                        href={`mailto:${sp.email}`}
                        className="flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-400"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {sp.email}
                      </a>
                    )}
                    {sp.phone && (
                      <a
                        href={`tel:${sp.phone}`}
                        className="flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-400"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden />
                        {sp.phone}
                      </a>
                    )}
                  </div>
                  {sp.bio && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sp.bio}</p>
                  )}
                  {sp.notes && (
                    <p className="mt-1 text-sm italic text-slate-400 dark:text-slate-500">
                      {sp.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setDialog({ open: true, spokesperson: sp })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(sp)}
                    aria-label={tCommon("delete")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SpokespersonFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        spokesperson={dialog.spokesperson}
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
