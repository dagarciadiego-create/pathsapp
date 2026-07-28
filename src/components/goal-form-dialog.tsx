"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { GOAL_KINDS, GOAL_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { AdvocacyGoal } from "@/lib/types";

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function GoalFormDialog({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal?: AdvocacyGoal | null;
}) {
  const t = useTranslations("GoalForm");

  return (
    <Modal open={open} onClose={onClose} title={goal ? t("titleEdit") : t("titleNew")}>
      {/* Mounted fresh each time the dialog opens, so form state always
          starts from the current `goal` without a state-syncing effect. */}
      {open && <GoalFormFields onClose={onClose} goal={goal} />}
    </Modal>
  );
}

function GoalFormFields({
  onClose,
  goal,
}: {
  onClose: () => void;
  goal?: AdvocacyGoal | null;
}) {
  const t = useTranslations("GoalForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(goal?.name ?? "");
  const [kind, setKind] = useState<string>(goal?.kind ?? GOAL_KINDS[0]);
  const [responsible, setResponsible] = useState(goal?.responsible ?? "");
  const [category, setCategory] = useState(goal?.category ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [targetDate, setTargetDate] = useState(toDateInputValue(goal?.targetDate));
  const [status, setStatus] = useState<string>(goal?.status ?? "IN_PROGRESS");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        kind,
        responsible,
        category: category || null,
        description: description || null,
        targetDate: targetDate || null,
        status,
      };
      if (goal) {
        await api.updateGoal(goal.id, payload);
      } else {
        await api.createGoal(payload);
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
      <Field label={t("name")} htmlFor="goal-name" required>
        <Input
          id="goal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <Field label={t("kind")} htmlFor="goal-kind" required>
        <Select id="goal-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          {GOAL_KINDS.map((k) => (
            <option key={k} value={k}>
              {tEnums(`goalKind.${k}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("responsible")} htmlFor="goal-responsible" required>
        <Input
          id="goal-responsible"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          placeholder={t("responsiblePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <Field label={t("category")} htmlFor="goal-category">
        <Input
          id="goal-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t("categoryPlaceholder")}
          maxLength={120}
        />
      </Field>

      <Field label={t("description")} htmlFor="goal-description">
        <Textarea
          id="goal-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          maxLength={4000}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("targetDate")} htmlFor="goal-target-date">
          <Input
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </Field>

        <Field label={t("status")} htmlFor="goal-status">
          <Select id="goal-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {GOAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`goalStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

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
