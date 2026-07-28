"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, Pencil, Link2Off, Building2, BookUser } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContactRelationBadge } from "./ui/status-badge";
import type { GoalContactWithContact } from "@/lib/types";
import type { ContactRelation } from "@/lib/constants";

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
                  href="/contacts"
                  title="Ver en el directorio"
                  className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400"
                >
                  <BookUser className="h-3.5 w-3.5" aria-hidden />
                </Link>
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
                aria-label="Edit"
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
