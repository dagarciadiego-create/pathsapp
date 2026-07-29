"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { MEDIA_TONES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { MediaCoverageWithGoal } from "@/lib/types";

export function MediaCoverageFormDialog({
  open,
  onClose,
  goals,
  item,
}: {
  open: boolean;
  onClose: () => void;
  goals: { id: string; name: string }[];
  item?: MediaCoverageWithGoal | null;
}) {
  const t = useTranslations("MediaCoverageForm");

  return (
    <Modal open={open} onClose={onClose} title={item ? t("titleEdit") : t("titleNew")}>
      {open && <MediaCoverageFormFields onClose={onClose} goals={goals} item={item} />}
    </Modal>
  );
}

function MediaCoverageFormFields({
  onClose,
  goals,
  item,
}: {
  onClose: () => void;
  goals: { id: string; name: string }[];
  item?: MediaCoverageWithGoal | null;
}) {
  const t = useTranslations("MediaCoverageForm");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [outlet, setOutlet] = useState(item?.outlet ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [publishedDate, setPublishedDate] = useState(
    toDateInputValue(item?.publishedDate) || toDateInputValue(new Date())
  );
  const [tone, setTone] = useState<string>(item?.tone ?? "NEUTRAL");
  const [reach, setReach] = useState(item?.reach?.toString() ?? "");
  const [goalId, setGoalId] = useState(item?.goalId ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        outlet,
        title,
        url: url || null,
        publishedDate,
        tone,
        reach: reach || null,
        goalId: goalId || null,
        notes: notes || null,
      };
      if (item) {
        await api.updateMediaCoverage(item.id, payload);
      } else {
        await api.createMediaCoverage(payload);
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
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("outlet")} htmlFor="media-outlet" required>
          <Input
            id="media-outlet"
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
            placeholder={t("outletPlaceholder")}
            required
            maxLength={200}
          />
        </Field>
        <Field label={t("publishedDate")} htmlFor="media-date" required>
          <Input
            id="media-date"
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label={t("title")} htmlFor="media-title" required>
        <Input
          id="media-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={300}
        />
      </Field>

      <Field label={t("url")} htmlFor="media-url">
        <Input
          id="media-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          maxLength={500}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("tone")} htmlFor="media-tone">
          <Select id="media-tone" value={tone} onChange={(e) => setTone(e.target.value)}>
            {MEDIA_TONES.map((tn) => (
              <option key={tn} value={tn}>
                {tEnums(`mediaTone.${tn}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("reach")} htmlFor="media-reach" hint={t("reachHint")}>
          <Input
            id="media-reach"
            type="number"
            min={0}
            value={reach}
            onChange={(e) => setReach(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t("goal")} htmlFor="media-goal">
        <Select id="media-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">{t("goalNone")}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={tCommon("notes")} htmlFor="media-notes">
        <Textarea
          id="media-notes"
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
