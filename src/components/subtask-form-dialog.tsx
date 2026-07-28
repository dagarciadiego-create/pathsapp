"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { ACTION_TYPES, SUBTASK_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { Subtask } from "@/lib/types";

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function SubtaskFormDialog({
  open,
  onClose,
  goalId,
  subtask,
}: {
  open: boolean;
  onClose: () => void;
  goalId: string;
  subtask?: Subtask | null;
}) {
  const t = useTranslations("SubtaskForm");

  return (
    <Modal open={open} onClose={onClose} title={subtask ? t("titleEdit") : t("titleNew")}>
      {open && <SubtaskFormFields onClose={onClose} goalId={goalId} subtask={subtask} />}
    </Modal>
  );
}

function SubtaskFormFields({
  onClose,
  goalId,
  subtask,
}: {
  onClose: () => void;
  goalId: string;
  subtask?: Subtask | null;
}) {
  const t = useTranslations("SubtaskForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(subtask?.name ?? "");
  const [actionType, setActionType] = useState<string>(subtask?.actionType ?? ACTION_TYPES[0]);
  const [isPlanned, setIsPlanned] = useState(subtask?.isPlanned ?? true);
  const [dueDate, setDueDate] = useState(toDateInputValue(subtask?.dueDate));
  const [status, setStatus] = useState<string>(subtask?.status ?? SUBTASK_STATUSES[0]);
  const [responsible, setResponsible] = useState(subtask?.responsible ?? "");
  const [notes, setNotes] = useState(subtask?.notes ?? "");
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
        isPlanned,
        dueDate: dueDate || null,
        status,
        responsible: responsible || null,
        notes: notes || null,
      };
      if (subtask) {
        await api.updateSubtask(subtask.id, payload);
      } else {
        await api.createSubtask(goalId, payload);
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
      <Field label={t("name")} htmlFor="subtask-name" required>
        <Input
          id="subtask-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("actionType")} htmlFor="subtask-type" required>
          <Select id="subtask-type" value={actionType} onChange={(e) => setActionType(e.target.value)}>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {tEnums(`actionType.${a}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("status")} htmlFor="subtask-status">
          <Select id="subtask-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {SUBTASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`subtaskStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("dueDate")} htmlFor="subtask-due-date">
          <Input
            id="subtask-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
        <Field label={t("responsible")} htmlFor="subtask-responsible">
          <Input
            id="subtask-responsible"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            maxLength={200}
          />
        </Field>
      </div>

      <Field label={t("isPlanned")} htmlFor="subtask-planned" hint={t("isPlannedHelp")}>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            id="subtask-planned"
            type="checkbox"
            checked={isPlanned}
            onChange={(e) => setIsPlanned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          {tEnums(`planned.${isPlanned}`)}
        </label>
      </Field>

      <Field label={tCommon("notes")} htmlFor="subtask-notes">
        <Textarea
          id="subtask-notes"
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
