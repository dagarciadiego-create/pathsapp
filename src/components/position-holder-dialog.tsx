"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Select, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/date-utils";
import type { PositionHolderWithContact } from "@/lib/types";

// Assigning a new holder (no `holder` prop) is a succession event: the
// server closes out whoever currently holds the position. Editing an
// existing holder (`holder` prop set) only corrects that one record's
// dates/notes — it never changes who the contact is.
export function PositionHolderDialog({
  open,
  onClose,
  positionId,
  contacts,
  holder,
}: {
  open: boolean;
  onClose: () => void;
  positionId: string;
  contacts: { id: string; name: string }[];
  holder?: PositionHolderWithContact | null;
}) {
  const t = useTranslations("PositionHolderForm");

  return (
    <Modal open={open} onClose={onClose} title={holder ? t("titleEdit") : t("titleAssign")}>
      {open && (
        <PositionHolderFields
          onClose={onClose}
          positionId={positionId}
          contacts={contacts}
          holder={holder}
        />
      )}
    </Modal>
  );
}

function PositionHolderFields({
  onClose,
  positionId,
  contacts,
  holder,
}: {
  onClose: () => void;
  positionId: string;
  contacts: { id: string; name: string }[];
  holder?: PositionHolderWithContact | null;
}) {
  const t = useTranslations("PositionHolderForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [contactId, setContactId] = useState(holder?.contactId ?? contacts[0]?.id ?? "");
  const [startDate, setStartDate] = useState(
    toDateInputValue(holder?.startDate) || toDateInputValue(new Date())
  );
  const [endDate, setEndDate] = useState(toDateInputValue(holder?.endDate));
  const [notes, setNotes] = useState(holder?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (holder) {
        await api.updatePositionHolder(holder.id, {
          startDate,
          endDate: endDate || null,
          notes: notes || null,
        });
      } else {
        await api.assignPositionHolder(positionId, {
          contactId,
          startDate,
          notes: notes || null,
        });
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
      {!holder && (
        <Field label={t("contact")} htmlFor="holder-contact" required>
          <Select
            id="holder-contact"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            required
          >
            {contacts.length === 0 && <option value="">{t("noContacts")}</option>}
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("startDate")} htmlFor="holder-start-date" required>
          <Input
            id="holder-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Field>
        {holder && (
          <Field label={t("endDate")} htmlFor="holder-end-date" hint={t("endDateHint")}>
            <Input
              id="holder-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        )}
      </div>

      <Field label={tCommon("notes")} htmlFor="holder-notes">
        <Textarea
          id="holder-notes"
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
        <Button type="submit" disabled={pending || (!holder && !contactId)}>
          {pending ? tCommon("saving") : holder ? tCommon("save") : t("submitAssign")}
        </Button>
      </div>
    </form>
  );
}
