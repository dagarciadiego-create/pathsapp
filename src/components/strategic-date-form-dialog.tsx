"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { STRATEGIC_DATE_KINDS } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { StrategicDate } from "@/lib/types";

export function StrategicDateFormDialog({
  open,
  onClose,
  strategicDate,
}: {
  open: boolean;
  onClose: () => void;
  strategicDate?: StrategicDate | null;
}) {
  const t = useTranslations("StrategicDateForm");

  return (
    <Modal open={open} onClose={onClose} title={strategicDate ? t("titleEdit") : t("titleNew")}>
      {open && <StrategicDateFormFields onClose={onClose} strategicDate={strategicDate} />}
    </Modal>
  );
}

function StrategicDateFormFields({
  onClose,
  strategicDate,
}: {
  onClose: () => void;
  strategicDate?: StrategicDate | null;
}) {
  const t = useTranslations("StrategicDateForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [title, setTitle] = useState(strategicDate?.title ?? "");
  const [kind, setKind] = useState<string>(strategicDate?.kind ?? STRATEGIC_DATE_KINDS[0]);
  const [date, setDate] = useState(toDateInputValue(strategicDate?.date));
  const [isRecurring, setIsRecurring] = useState(strategicDate?.isRecurring ?? false);
  const [description, setDescription] = useState(strategicDate?.description ?? "");
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
        date,
        isRecurring,
        description: description || null,
      };
      if (strategicDate) {
        await api.updateStrategicDate(strategicDate.id, payload);
      } else {
        await api.createStrategicDate(payload);
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
      <Field label={t("title")} htmlFor="strategic-date-title" required>
        <Input
          id="strategic-date-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("kind")} htmlFor="strategic-date-kind" required>
          <Select id="strategic-date-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            {STRATEGIC_DATE_KINDS.map((k) => (
              <option key={k} value={k}>
                {tEnums(`strategicDateKind.${k}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("date")} htmlFor="strategic-date-date" required>
          <Input
            id="strategic-date-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label={t("isRecurring")} htmlFor="strategic-date-recurring" hint={t("isRecurringHint")}>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            id="strategic-date-recurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          {t("isRecurringLabel")}
        </label>
      </Field>

      <Field label={t("description")} htmlFor="strategic-date-description">
        <Textarea
          id="strategic-date-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
