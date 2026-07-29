"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { AdvocacyGoal } from "@/lib/types";

export function DuplicateGoalDialog({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal: AdvocacyGoal;
}) {
  const t = useTranslations("DuplicateGoalForm");

  return (
    <Modal open={open} onClose={onClose} title={t("title")}>
      {open && <DuplicateGoalFields onClose={onClose} goal={goal} />}
    </Modal>
  );
}

function DuplicateGoalFields({ onClose, goal }: { onClose: () => void; goal: AdvocacyGoal }) {
  const t = useTranslations("DuplicateGoalForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(t("copyName", { name: goal.name }));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const created = await api.duplicateGoal<{ id: string }>(goal.id, { name });
      router.push(`/goals/${created.id}`);
      onClose();
    } catch {
      setError(tCommon("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t("description")}</p>
      <Field label={t("name")} htmlFor="duplicate-goal-name" required>
        <Input
          id="duplicate-goal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          autoFocus
        />
      </Field>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
