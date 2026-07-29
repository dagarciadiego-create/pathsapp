"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { DEADLINE_KINDS, DEADLINE_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { DeadlineWithGoal } from "@/lib/types";

export function DeadlineFormDialog({
  open,
  onClose,
  goals,
  deadline,
}: {
  open: boolean;
  onClose: () => void;
  goals: { id: string; name: string }[];
  deadline?: DeadlineWithGoal | null;
}) {
  const t = useTranslations("DeadlineForm");

  return (
    <Modal open={open} onClose={onClose} title={deadline ? t("titleEdit") : t("titleNew")}>
      {open && <DeadlineFormFields onClose={onClose} goals={goals} deadline={deadline} />}
    </Modal>
  );
}

function DeadlineFormFields({
  onClose,
  goals,
  deadline,
}: {
  onClose: () => void;
  goals: { id: string; name: string }[];
  deadline?: DeadlineWithGoal | null;
}) {
  const t = useTranslations("DeadlineForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(deadline?.title ?? "");
  const [kind, setKind] = useState<string>(deadline?.kind ?? DEADLINE_KINDS[0]);
  const [description, setDescription] = useState(deadline?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(deadline?.dueDate));
  const [responsible, setResponsible] = useState(deadline?.responsible ?? "");
  const [status, setStatus] = useState<string>(deadline?.status ?? "OPEN");
  const [goalId, setGoalId] = useState(deadline?.goalId ?? "");
  const [notes, setNotes] = useState(deadline?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        title,
        kind,
        description: description || null,
        dueDate,
        responsible: responsible || null,
        status,
        goalId: goalId || null,
        notes: notes || null,
      };
      if (deadline) {
        await api.updateDeadline(deadline.id, payload);
      } else {
        await api.createDeadline(payload);
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
      <Field label={t("title")} htmlFor="deadline-title" required>
        <Input
          id="deadline-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("kind")} htmlFor="deadline-kind" required>
          <Select id="deadline-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            {DEADLINE_KINDS.map((k) => (
              <option key={k} value={k}>
                {tEnums(`deadlineKind.${k}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("dueDate")} htmlFor="deadline-due-date" required>
          <Input
            id="deadline-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("status")} htmlFor="deadline-status">
          <Select id="deadline-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {DEADLINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`deadlineStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("responsible")} htmlFor="deadline-responsible">
          <Input
            id="deadline-responsible"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            maxLength={200}
          />
        </Field>
      </div>

      <Field label={t("goal")} htmlFor="deadline-goal">
        <Select id="deadline-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">{t("goalNone")}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("description")} htmlFor="deadline-description">
        <Textarea
          id="deadline-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </Field>

      <Field label={tCommon("notes")} htmlFor="deadline-notes">
        <Textarea
          id="deadline-notes"
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
