"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { COMMITMENT_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { CommitmentWithGoal } from "@/lib/types";

export function CommitmentFormDialog({
  open,
  onClose,
  contactId,
  goals,
  commitment,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string;
  goals: { id: string; name: string }[];
  commitment?: CommitmentWithGoal | null;
}) {
  const t = useTranslations("Commitments");

  return (
    <Modal open={open} onClose={onClose} title={commitment ? t("titleEdit") : t("titleNew")}>
      {open && (
        <CommitmentFormFields
          onClose={onClose}
          contactId={contactId}
          goals={goals}
          commitment={commitment}
        />
      )}
    </Modal>
  );
}

function CommitmentFormFields({
  onClose,
  contactId,
  goals,
  commitment,
}: {
  onClose: () => void;
  contactId: string;
  goals: { id: string; name: string }[];
  commitment?: CommitmentWithGoal | null;
}) {
  const t = useTranslations("Commitments");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [description, setDescription] = useState(commitment?.description ?? "");
  const [madeDate, setMadeDate] = useState(
    toDateInputValue(commitment?.madeDate) || toDateInputValue(new Date().toISOString())
  );
  const [followUpDate, setFollowUpDate] = useState(toDateInputValue(commitment?.followUpDate));
  const [status, setStatus] = useState<string>(commitment?.status ?? "PENDING");
  const [notes, setNotes] = useState(commitment?.notes ?? "");
  const [goalId, setGoalId] = useState(commitment?.goalId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        description,
        madeDate,
        followUpDate: followUpDate || null,
        status,
        notes: notes || null,
        goalId: goalId || null,
      };
      if (commitment) {
        await api.updateCommitment(commitment.id, payload);
      } else {
        await api.createCommitment(contactId, payload);
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
      <Field label={t("description")} htmlFor="commitment-description" required>
        <Textarea
          id="commitment-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          required
          maxLength={2000}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("madeDate")} htmlFor="commitment-made-date" required>
          <Input
            id="commitment-made-date"
            type="date"
            value={madeDate}
            onChange={(e) => setMadeDate(e.target.value)}
            required
          />
        </Field>
        <Field label={t("followUpDate")} htmlFor="commitment-followup-date">
          <Input
            id="commitment-followup-date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("status")} htmlFor="commitment-status">
          <Select id="commitment-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {COMMITMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tEnums(`commitmentStatus.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("goal")} htmlFor="commitment-goal">
          <Select id="commitment-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">{t("goalNone")}</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={tCommon("notes")} htmlFor="commitment-notes">
        <Textarea
          id="commitment-notes"
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
