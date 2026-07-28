"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { CONTACT_RELATIONS } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { Contact } from "@/lib/types";

export function ContactFormDialog({
  open,
  onClose,
  goalId,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  goalId: string;
  contact?: Contact | null;
}) {
  const t = useTranslations("ContactForm");

  return (
    <Modal open={open} onClose={onClose} title={contact ? t("titleEdit") : t("titleNew")}>
      {open && <ContactFormFields onClose={onClose} goalId={goalId} contact={contact} />}
    </Modal>
  );
}

function ContactFormFields({
  onClose,
  goalId,
  contact,
}: {
  onClose: () => void;
  goalId: string;
  contact?: Contact | null;
}) {
  const t = useTranslations("ContactForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(contact?.name ?? "");
  const [organization, setOrganization] = useState(contact?.organization ?? "");
  const [role, setRole] = useState(contact?.role ?? "");
  const [relation, setRelation] = useState<string>(contact?.relation ?? CONTACT_RELATIONS[0]);
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        organization: organization || null,
        role: role || null,
        relation,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      };
      if (contact) {
        await api.updateContact(contact.id, payload);
      } else {
        await api.createContact(goalId, payload);
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

      <Field label={t("relation")} htmlFor="contact-relation" required>
        <Select id="contact-relation" value={relation} onChange={(e) => setRelation(e.target.value)}>
          {CONTACT_RELATIONS.map((r) => (
            <option key={r} value={r}>
              {tEnums(`contactRelation.${r}`)}
            </option>
          ))}
        </Select>
      </Field>

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

      <Field label={tCommon("notes")} htmlFor="contact-notes">
        <Textarea
          id="contact-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </Field>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
