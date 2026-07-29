"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Select, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";

export function ConnectionFormDialog({
  open,
  onClose,
  contactId,
  otherContacts,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string;
  otherContacts: { id: string; name: string }[];
}) {
  const t = useTranslations("Connections");

  return (
    <Modal open={open} onClose={onClose} title={t("titleNew")}>
      {open && (
        <ConnectionFormFields onClose={onClose} contactId={contactId} otherContacts={otherContacts} />
      )}
    </Modal>
  );
}

function ConnectionFormFields({
  onClose,
  contactId,
  otherContacts,
}: {
  onClose: () => void;
  contactId: string;
  otherContacts: { id: string; name: string }[];
}) {
  const t = useTranslations("Connections");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [otherContactId, setOtherContactId] = useState(otherContacts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api.createConnection(contactId, { otherContactId, description });
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
      <Field label={t("otherContact")} htmlFor="connection-other-contact" required>
        <Select
          id="connection-other-contact"
          value={otherContactId}
          onChange={(e) => setOtherContactId(e.target.value)}
          required
        >
          {otherContacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("description")} htmlFor="connection-description" required hint={t("descriptionHint")}>
        <Textarea
          id="connection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          required
          maxLength={500}
        />
      </Field>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending || !otherContactId}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
