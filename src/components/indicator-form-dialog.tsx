"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { IndicatorWithGoal } from "@/lib/types";

export function IndicatorFormDialog({
  open,
  onClose,
  goals,
  fixedGoalId,
  indicator,
}: {
  open: boolean;
  onClose: () => void;
  goals: { id: string; name: string }[];
  fixedGoalId?: string;
  indicator?: IndicatorWithGoal | null;
}) {
  const t = useTranslations("IndicatorForm");

  return (
    <Modal open={open} onClose={onClose} title={indicator ? t("titleEdit") : t("titleNew")}>
      {open && (
        <IndicatorFormFields
          onClose={onClose}
          goals={goals}
          fixedGoalId={fixedGoalId}
          indicator={indicator}
        />
      )}
    </Modal>
  );
}

function IndicatorFormFields({
  onClose,
  goals,
  fixedGoalId,
  indicator,
}: {
  onClose: () => void;
  goals: { id: string; name: string }[];
  fixedGoalId?: string;
  indicator?: IndicatorWithGoal | null;
}) {
  const t = useTranslations("IndicatorForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [goalId, setGoalId] = useState(indicator?.goalId ?? fixedGoalId ?? "");
  const [name, setName] = useState(indicator?.name ?? "");
  const [targetValue, setTargetValue] = useState(indicator ? String(indicator.targetValue) : "");
  const [currentValue, setCurrentValue] = useState(
    indicator ? String(indicator.currentValue) : "0"
  );
  const [unit, setUnit] = useState(indicator?.unit ?? "");
  const [notes, setNotes] = useState(indicator?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        goalId: goalId || null,
        name,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue || 0),
        unit: unit || null,
        notes: notes || null,
      };
      if (indicator) {
        await api.updateIndicator(indicator.id, payload);
      } else {
        await api.createIndicator(payload);
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
      {!fixedGoalId && (
        <Field label={t("goal")} htmlFor="indicator-goal">
          <Select id="indicator-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">{t("goalNone")}</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={t("name")} htmlFor="indicator-name" required>
        <Input
          id="indicator-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label={t("targetValue")} htmlFor="indicator-target" required>
          <Input
            id="indicator-target"
            type="number"
            step="any"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        </Field>
        <Field label={t("currentValue")} htmlFor="indicator-current">
          <Input
            id="indicator-current"
            type="number"
            step="any"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        </Field>
        <Field label={t("unit")} htmlFor="indicator-unit">
          <Input
            id="indicator-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={t("unitPlaceholder")}
            maxLength={40}
          />
        </Field>
      </div>

      <Field label={tCommon("notes")} htmlFor="indicator-notes">
        <Textarea
          id="indicator-notes"
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
