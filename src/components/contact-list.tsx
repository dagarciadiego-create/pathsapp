"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, Pencil, Link2Off, Building2, BookUser } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ContactRelationBadge, StanceBadge } from "./ui/status-badge";
import { api } from "@/lib/api-client";
import { STANCE_VALUES } from "@/lib/constants";
import type { GoalContactWithContact } from "@/lib/types";
import type { ContactRelation, Stance } from "@/lib/constants";

export function ContactList({
  goalContacts,
  onEdit,
  onUnlink,
}: {
  goalContacts: GoalContactWithContact[];
  onEdit: (goalContact: GoalContactWithContact) => void;
  onUnlink: (goalContact: GoalContactWithContact) => void;
}) {
  const tEnums = useTranslations("Enums");
  const t = useTranslations("GoalDetail");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [stancePendingId, setStancePendingId] = useState<string | null>(null);

  async function handleStanceChange(goalContactId: string, stance: string) {
    if (!stance) return;
    setStancePendingId(goalContactId);
    try {
      await api.updateGoalContact(goalContactId, { stance });
      router.refresh();
    } finally {
      setStancePendingId(null);
    }
  }

  if (goalContacts.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("noContacts")}</p>;
  }

  return (
    <ul className="space-y-3">
      {goalContacts.map((goalContact) => {
        const { contact } = goalContact;
        return (
          <li
            key={goalContact.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
                <ContactRelationBadge
                  relation={goalContact.relation as ContactRelation}
                  label={tEnums(`contactRelation.${goalContact.relation as ContactRelation}`)}
                />
                <Link
                  href={`/contacts/${contact.id}`}
                  title={t("viewInDirectory")}
                  aria-label={t("viewInDirectory")}
                  className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400"
                >
                  <BookUser className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <select
                  value={goalContact.stance ?? ""}
                  onChange={(e) => handleStanceChange(goalContact.id, e.target.value)}
                  disabled={stancePendingId === goalContact.id}
                  aria-label={t("stance")}
                  className="rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
                {goalContact.stance && (
                  <StanceBadge
                    stance={goalContact.stance as Stance}
                    label={tEnums(`stance.${goalContact.stance as Stance}`)}
                  />
                )}
              </div>
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
              {goalContact.notes && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {goalContact.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(goalContact)}
                aria-label={tCommon("edit")}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onUnlink(goalContact)}
                aria-label={t("unlinkContact")}
                title={t("unlinkContact")}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
              >
                <Link2Off className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
