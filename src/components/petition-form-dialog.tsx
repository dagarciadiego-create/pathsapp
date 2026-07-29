"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { Petition } from "@/lib/types";

export function PetitionFormDialog({
  open,
  onClose,
  petition,
}: {
  open: boolean;
  onClose: () => void;
  petition?: Petition | null;
}) {
  const t = useTranslations("PetitionForm");

  return (
    <Modal open={open} onClose={onClose} title={petition ? t("titleEdit") : t("titleNew")}>
      {open && <PetitionFormFields onClose={onClose} petition={petition} />}
    </Modal>
  );
}

function PetitionFormFields({
  onClose,
  petition,
}: {
  onClose: () => void;
  petition?: Petition | null;
}) {
  const t = useTranslations("PetitionForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(petition?.title ?? "");
  const [category, setCategory] = useState(petition?.category ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = { title, category: category || null };
      if (petition) {
        await api.updatePetition(petition.id, payload);
      } else {
        await api.createPetition(payload);
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
      <Field label={t("title")} htmlFor="petition-title" required>
        <Input
          id="petition-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <Field label={t("category")} htmlFor="petition-category">
        <Input
          id="petition-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t("categoryPlaceholder")}
          maxLength={120}
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
