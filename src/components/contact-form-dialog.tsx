"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { CONTACT_RELATIONS } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { Contact, GoalContactWithContact } from "@/lib/types";

type Mode = "existing" | "new";

export function ContactFormDialog({
  open,
  onClose,
  goalId,
  availableContacts,
  goalContact,
}: {
  open: boolean;
  onClose: () => void;
  goalId: string;
  availableContacts: Contact[];
  goalContact?: GoalContactWithContact | null;
}) {
  const t = useTranslations("ContactForm");

  return (
    <Modal open={open} onClose={onClose} title={goalContact ? t("titleEdit") : t("titleNew")}>
      {open && (
        <ContactFormFields
          onClose={onClose}
          goalId={goalId}
          availableContacts={availableContacts}
          goalContact={goalContact}
        />
      )}
    </Modal>
  );
}

function ContactFormFields({
  onClose,
  goalId,
  availableContacts,
  goalContact,
}: {
  onClose: () => void;
  goalId: string;
  availableContacts: Contact[];
  goalContact?: GoalContactWithContact | null;
}) {
  const t = useTranslations("ContactForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const isEditing = Boolean(goalContact);
  const [mode, setMode] = useState<Mode>(availableContacts.length > 0 ? "existing" : "new");
  const [contactId, setContactId] = useState(availableContacts[0]?.id ?? "");
  const [name, setName] = useState(goalContact?.contact.name ?? "");
  const [organization, setOrganization] = useState(goalContact?.contact.organization ?? "");
  const [role, setRole] = useState(goalContact?.contact.role ?? "");
  const [email, setEmail] = useState(goalContact?.contact.email ?? "");
  const [phone, setPhone] = useState(goalContact?.contact.phone ?? "");
  const [relation, setRelation] = useState<string>(goalContact?.relation ?? CONTACT_RELATIONS[0]);
  const [linkNotes, setLinkNotes] = useState(goalContact?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (isEditing && goalContact) {
        await api.updateGoalContact(goalContact.id, {
          relation,
          notes: linkNotes || null,
          contact: {
            name,
            organization: organization || null,
            role: role || null,
            email: email || null,
            phone: phone || null,
          },
        });
      } else if (mode === "existing") {
        await api.linkContact(goalId, {
          contactId,
          relation,
          notes: linkNotes || null,
        });
      } else {
        await api.linkContact(goalId, {
          contact: {
            name,
            organization: organization || null,
            role: role || null,
            email: email || null,
            phone: phone || null,
          },
          relation,
          notes: linkNotes || null,
        });
      }
      router.refresh();
      onClose();
    } catch {
      setError(tCommon("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {!isEditing && availableContacts.length > 0 && (
        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {(["existing", "new"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "flex-1 rounded-md bg-white px-2 py-1.5 font-medium text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                  : "flex-1 rounded-md px-2 py-1.5 font-medium text-slate-500 dark:text-slate-400"
              }
            >
              {m === "existing" ? t("modeExisting") : t("modeNew")}
            </button>
          ))}
        </div>
      )}

      {!isEditing && mode === "existing" ? (
        <Field label={t("pickContact")} htmlFor="contact-pick" required>
          <Select id="contact-pick" value={contactId} onChange={(e) => setContactId(e.target.value)}>
            {availableContacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.organization ? ` — ${c.organization}` : ""}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <Field label={t("name")} htmlFor="contact-name" required>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("organization")} htmlFor="contact-org">
              <Input
                id="contact-org"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                maxLength={200}
              />
            </Field>
            <Field label={t("role")} htmlFor="contact-role">
              <Input
                id="contact-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={200}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("email")} htmlFor="contact-email">
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
              />
            </Field>
            <Field label={t("phone")} htmlFor="contact-phone">
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={60}
              />
            </Field>
          </div>
        </>
      )}

      <Field label={t("relation")} htmlFor="contact-relation" required>
        <Select id="contact-relation" value={relation} onChange={(e) => setRelation(e.target.value)}>
          {CONTACT_RELATIONS.map((r) => (
            <option key={r} value={r}>
              {tEnums(`contactRelation.${r}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("linkNotes")} htmlFor="contact-link-notes">
        <Textarea
          id="contact-link-notes"
          value={linkNotes}
          onChange={(e) => setLinkNotes(e.target.value)}
          placeholder={t("linkNotesPlaceholder")}
          maxLength={2000}
        />
      </Field>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending || (!isEditing && mode === "existing" && !contactId)}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
