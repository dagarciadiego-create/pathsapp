"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { Evidence } from "@/lib/types";

export function EvidenceFormDialog({
  open,
  onClose,
  petitionId,
  evidence,
}: {
  open: boolean;
  onClose: () => void;
  petitionId: string;
  evidence?: Evidence | null;
}) {
  const t = useTranslations("EvidenceForm");

  return (
    <Modal open={open} onClose={onClose} title={evidence ? t("titleEdit") : t("titleNew")}>
      {open && (
        <EvidenceFormFields onClose={onClose} petitionId={petitionId} evidence={evidence} />
      )}
    </Modal>
  );
}

function EvidenceFormFields({
  onClose,
  petitionId,
  evidence,
}: {
  onClose: () => void;
  petitionId: string;
  evidence?: Evidence | null;
}) {
  const t = useTranslations("EvidenceForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(evidence?.title ?? "");
  const [source, setSource] = useState(evidence?.source ?? "");
  const [url, setUrl] = useState(evidence?.url ?? "");
  const [summary, setSummary] = useState(evidence?.summary ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        title,
        source: source || null,
        url: url || null,
        summary: summary || null,
        petitionId,
      };
      if (evidence) {
        await api.updateEvidence(evidence.id, payload);
      } else {
        await api.createEvidence(payload);
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
      <Field label={t("title")} htmlFor="evidence-title" required>
        <Input
          id="evidence-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("source")} htmlFor="evidence-source">
          <Input
            id="evidence-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label={t("url")} htmlFor="evidence-url">
          <Input
            id="evidence-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            maxLength={500}
          />
        </Field>
      </div>

      <Field label={t("summary")} htmlFor="evidence-summary">
        <Textarea
          id="evidence-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
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
