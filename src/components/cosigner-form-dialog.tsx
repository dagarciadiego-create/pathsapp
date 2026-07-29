"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { COSIGNER_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { JointLetterCosigner } from "@/lib/types";

export function CosignerFormDialog({
  open,
  onClose,
  jointLetterId,
  cosigner,
}: {
  open: boolean;
  onClose: () => void;
  jointLetterId: string;
  cosigner?: JointLetterCosigner | null;
}) {
  const t = useTranslations("CosignerForm");

  return (
    <Modal open={open} onClose={onClose} title={cosigner ? t("titleEdit") : t("titleNew")}>
      {open && (
        <CosignerFormFields onClose={onClose} jointLetterId={jointLetterId} cosigner={cosigner} />
      )}
    </Modal>
  );
}

function CosignerFormFields({
  onClose,
  jointLetterId,
  cosigner,
}: {
  onClose: () => void;
  jointLetterId: string;
  cosigner?: JointLetterCosigner | null;
}) {
  const t = useTranslations("CosignerForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [organization, setOrganization] = useState(cosigner?.organization ?? "");
  const [contactName, setContactName] = useState(cosigner?.contactName ?? "");
  const [status, setStatus] = useState<string>(cosigner?.status ?? "INVITED");
  const [notes, setNotes] = useState(cosigner?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        organization,
        contactName: contactName || null,
        status,
        notes: notes || null,
      };
      if (cosigner) {
        await api.updateCosigner(cosigner.id, payload);
      } else {
        await api.addCosigner(jointLetterId, payload);
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
      <Field label={t("organization")} htmlFor="cosigner-org" required>
        <Input
          id="cosigner-org"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("contactName")} htmlFor="cosigner-contact">
          <Input
            id="cosigner-contact"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label={t("status")} htmlFor="cosigner-status">
          <Select id="cosigner-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {COSIGNER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`cosignerStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={tCommon("notes")} htmlFor="cosigner-notes">
        <Textarea
          id="cosigner-notes"
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
