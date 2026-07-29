"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { AttachmentSection } from "./attachment-section";
import { ACTION_TYPES, SUBTASK_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { Attachment, SubtaskWithAttachments } from "@/lib/types";

export function InteractionFormDialog({
  open,
  onClose,
  contactId,
  goals,
  interaction,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string;
  goals: { id: string; name: string }[];
  interaction?: SubtaskWithAttachments | null;
}) {
  const t = useTranslations("Interactions");

  return (
    <Modal open={open} onClose={onClose} title={interaction ? t("titleEdit") : t("titleNew")}>
      {open && (
        <InteractionFormFields
          onClose={onClose}
          contactId={contactId}
          goals={goals}
          interaction={interaction}
        />
      )}
    </Modal>
  );
}

function InteractionFormFields({
  onClose,
  contactId,
  goals,
  interaction,
}: {
  onClose: () => void;
  contactId: string;
  goals: { id: string; name: string }[];
  interaction?: SubtaskWithAttachments | null;
}) {
  const t = useTranslations("Interactions");
  const tSubtask = useTranslations("SubtaskForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(interaction?.name ?? "");
  const [actionType, setActionType] = useState<string>(interaction?.actionType ?? ACTION_TYPES[0]);
  const [dueDate, setDueDate] = useState(toDateInputValue(interaction?.dueDate));
  const [status, setStatus] = useState<string>(interaction?.status ?? "DONE");
  const [responsible, setResponsible] = useState(interaction?.responsible ?? "");
  const [notes, setNotes] = useState(interaction?.notes ?? "");
  const [goalId, setGoalId] = useState(interaction?.goalId ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(interaction?.attachments ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        actionType,
        dueDate: dueDate || null,
        status,
        responsible: responsible || null,
        notes: notes || null,
        goalId: goalId || null,
      };
      if (interaction) {
        await api.updateInteraction(interaction.id, payload);
      } else {
        await api.createInteraction(contactId, payload);
      }
      router.refresh();
      onClose();
    } catch {
      setError(tCommon("error"));
    } finally {
      setPending(false);
    }
  }

  function handleAttachmentsChange(next: Attachment[]) {
    setAttachments(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label={t("summary")} htmlFor="interaction-name" required>
        <Input
          id="interaction-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("summaryPlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tSubtask("actionType")} htmlFor="interaction-type" required>
          <Select id="interaction-type" value={actionType} onChange={(e) => setActionType(e.target.value)}>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {tEnums(`actionType.${a}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("date")} htmlFor="interaction-date">
          <Input
            id="interaction-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tSubtask("status")} htmlFor="interaction-status">
          <Select id="interaction-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {SUBTASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`subtaskStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("goal")} htmlFor="interaction-goal">
          <Select id="interaction-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">{t("goalNone")}</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={tSubtask("responsible")} htmlFor="interaction-responsible">
        <Input
          id="interaction-responsible"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          maxLength={200}
        />
      </Field>

      <Field label={t("notesLabel")} htmlFor="interaction-notes" hint={t("notesHint")}>
        <Textarea
          id="interaction-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </Field>

      {interaction ? (
        <AttachmentSection
          subtaskId={interaction.id}
          attachments={attachments}
          onAttachmentsChange={handleAttachmentsChange}
        />
      ) : (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t("saveFirstForAttachments")}</p>
      )}

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
