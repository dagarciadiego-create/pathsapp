"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { Position } from "@/lib/types";

export function PositionFormDialog({
  open,
  onClose,
  position,
}: {
  open: boolean;
  onClose: () => void;
  position?: Position | null;
}) {
  const t = useTranslations("PositionForm");

  return (
    <Modal open={open} onClose={onClose} title={position ? t("titleEdit") : t("titleNew")}>
      {open && <PositionFormFields onClose={onClose} position={position} />}
    </Modal>
  );
}

function PositionFormFields({
  onClose,
  position,
}: {
  onClose: () => void;
  position?: Position | null;
}) {
  const t = useTranslations("PositionForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(position?.title ?? "");
  const [organization, setOrganization] = useState(position?.organization ?? "");
  const [notes, setNotes] = useState(position?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        title,
        organization: organization || null,
        notes: notes || null,
      };
      if (position) {
        await api.updatePosition(position.id, payload);
      } else {
        await api.createPosition(payload);
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
      <Field label={t("title")} htmlFor="position-title" required>
        <Input
          id="position-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <Field label={t("organization")} htmlFor="position-organization">
        <Input
          id="position-organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          maxLength={200}
        />
      </Field>

      <Field label={tCommon("notes")} htmlFor="position-notes">
        <Textarea
          id="position-notes"
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
