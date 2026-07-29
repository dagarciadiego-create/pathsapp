"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";

// Always adds a new version — petition text is immutable history, so
// there's no "edit" mode here, only "add the next version".
export function PetitionVersionDialog({
  open,
  onClose,
  petitionId,
}: {
  open: boolean;
  onClose: () => void;
  petitionId: string;
}) {
  const t = useTranslations("PetitionVersionForm");

  return (
    <Modal open={open} onClose={onClose} title={t("title")}>
      {open && <PetitionVersionFields onClose={onClose} petitionId={petitionId} />}
    </Modal>
  );
}

function PetitionVersionFields({
  onClose,
  petitionId,
}: {
  onClose: () => void;
  petitionId: string;
}) {
  const t = useTranslations("PetitionVersionForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [contentEs, setContentEs] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api.addPetitionVersion(petitionId, {
        contentEs,
        contentEn: contentEn || null,
        notes: notes || null,
      });
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
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t("description")}</p>

      <Field label={t("contentEs")} htmlFor="version-content-es" required>
        <Textarea
          id="version-content-es"
          value={contentEs}
          onChange={(e) => setContentEs(e.target.value)}
          rows={6}
          required
          maxLength={8000}
        />
      </Field>

      <Field label={t("contentEn")} htmlFor="version-content-en" hint={t("contentEnHint")}>
        <Textarea
          id="version-content-en"
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          rows={6}
          maxLength={8000}
        />
      </Field>

      <Field label={t("changeNotes")} htmlFor="version-notes" hint={t("changeNotesHint")}>
        <Textarea
          id="version-notes"
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
          {pending ? tCommon("saving") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
