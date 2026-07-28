"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, Input } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { DirectoryContactFormDialog } from "./directory-contact-form-dialog";
import { api } from "@/lib/api-client";
import type { ContactWithGoals } from "@/lib/types";

export function ContactsDirectory({ initialContacts }: { initialContacts: ContactWithGoals[] }) {
  const t = useTranslations("ContactDirectory");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; contact?: ContactWithGoals | null }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<ContactWithGoals | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialContacts;
    return initialContacts.filter((c) =>
      [c.name, c.organization, c.role].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [initialContacts, query]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await api.deleteContact(deleting.id);
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
        <Button onClick={() => setDialog({ open: true, contact: null })}>
          <Plus className="h-4 w-4" />
          {t("newContact")}
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
          {initialContacts.length === 0 ? t("emptyState") : t("emptyStateFiltered")}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((contact) => (
            <li
              key={contact.id}
              id={`contact-${contact.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{contact.name}</p>
                  {(contact.organization || contact.role) && (
                    <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {[contact.role, contact.organization].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
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
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {contact.notes}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {t("columnGoals")}:
                    </span>
                    {contact.goalLinks.length === 0 ? (
                      <span className="text-xs italic text-slate-400 dark:text-slate-500">
                        {t("noGoalsLinked")}
                      </span>
                    ) : (
                      contact.goalLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`/goals/${link.goal.id}`}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-900/40 dark:hover:text-teal-300"
                        >
                          {link.goal.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setDialog({ open: true, contact })}
                    aria-label={tCommon("edit")}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(contact)}
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

      <DirectoryContactFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        contact={dialog.contact}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        pending={deletePending}
        body={t("deleteConfirmBody")}
      />
    </div>
  );
}
