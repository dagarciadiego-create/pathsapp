"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { JointLetterWithGoalAndCosigners } from "@/lib/types";

export function JointLetterFormDialog({
  open,
  onClose,
  goals,
  jointLetter,
}: {
  open: boolean;
  onClose: () => void;
  goals: { id: string; name: string }[];
  jointLetter?: JointLetterWithGoalAndCosigners | null;
}) {
  const t = useTranslations("JointLetterForm");

  return (
    <Modal open={open} onClose={onClose} title={jointLetter ? t("titleEdit") : t("titleNew")}>
      {open && <JointLetterFormFields onClose={onClose} goals={goals} jointLetter={jointLetter} />}
    </Modal>
  );
}

function JointLetterFormFields({
  onClose,
  goals,
  jointLetter,
}: {
  onClose: () => void;
  goals: { id: string; name: string }[];
  jointLetter?: JointLetterWithGoalAndCosigners | null;
}) {
  const t = useTranslations("JointLetterForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(jointLetter?.title ?? "");
  const [targetName, setTargetName] = useState(jointLetter?.targetName ?? "");
  const [sentDate, setSentDate] = useState(toDateInputValue(jointLetter?.sentDate));
  const [url, setUrl] = useState(jointLetter?.url ?? "");
  const [content, setContent] = useState(jointLetter?.content ?? "");
  const [goalId, setGoalId] = useState(jointLetter?.goalId ?? "");
  const [notes, setNotes] = useState(jointLetter?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        title,
        targetName: targetName || null,
        sentDate: sentDate || null,
        url: url || null,
        content: content || null,
        goalId: goalId || null,
        notes: notes || null,
      };
      if (jointLetter) {
        await api.updateJointLetter(jointLetter.id, payload);
      } else {
        await api.createJointLetter(payload);
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
      <Field label={t("title")} htmlFor="letter-title" required>
        <Input
          id="letter-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("targetName")} htmlFor="letter-target">
          <Input
            id="letter-target"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder={t("targetNamePlaceholder")}
            maxLength={200}
          />
        </Field>
        <Field label={t("sentDate")} htmlFor="letter-sent-date">
          <Input
            id="letter-sent-date"
            type="date"
            value={sentDate}
            onChange={(e) => setSentDate(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t("url")} htmlFor="letter-url">
        <Input
          id="letter-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          maxLength={500}
        />
      </Field>

      <Field label={t("goal")} htmlFor="letter-goal">
        <Select id="letter-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">{t("goalNone")}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("content")} htmlFor="letter-content">
        <Textarea
          id="letter-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={8000}
        />
      </Field>

      <Field label={tCommon("notes")} htmlFor="letter-notes">
        <Textarea
          id="letter-notes"
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
