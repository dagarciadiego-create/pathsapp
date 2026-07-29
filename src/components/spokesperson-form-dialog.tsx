"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal } from "./ui/modal";
import { Field, Input, Textarea, Button } from "./ui/form";
import { api } from "@/lib/api-client";
import type { Spokesperson } from "@/lib/types";

export function SpokespersonFormDialog({
  open,
  onClose,
  spokesperson,
}: {
  open: boolean;
  onClose: () => void;
  spokesperson?: Spokesperson | null;
}) {
  const t = useTranslations("SpokespersonForm");

  return (
    <Modal open={open} onClose={onClose} title={spokesperson ? t("titleEdit") : t("titleNew")}>
      {open && <SpokespersonFormFields onClose={onClose} spokesperson={spokesperson} />}
    </Modal>
  );
}

function SpokespersonFormFields({
  onClose,
  spokesperson,
}: {
  onClose: () => void;
  spokesperson?: Spokesperson | null;
}) {
  const t = useTranslations("SpokespersonForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [name, setName] = useState(spokesperson?.name ?? "");
  const [role, setRole] = useState(spokesperson?.role ?? "");
  const [topics, setTopics] = useState(spokesperson?.topics ?? "");
  const [email, setEmail] = useState(spokesperson?.email ?? "");
  const [phone, setPhone] = useState(spokesperson?.phone ?? "");
  const [bio, setBio] = useState(spokesperson?.bio ?? "");
  const [mediaTrained, setMediaTrained] = useState(spokesperson?.mediaTrained ?? false);
  const [notes, setNotes] = useState(spokesperson?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        role: role || null,
        topics: topics || null,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        mediaTrained,
        notes: notes || null,
      };
      if (spokesperson) {
        await api.updateSpokesperson(spokesperson.id, payload);
      } else {
        await api.createSpokesperson(payload);
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
      <Field label={t("name")} htmlFor="spokesperson-name" required>
        <Input
          id="spokesperson-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("role")} htmlFor="spokesperson-role">
          <Input
            id="spokesperson-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label={t("topics")} htmlFor="spokesperson-topics" hint={t("topicsHint")}>
          <Input
            id="spokesperson-topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder={t("topicsPlaceholder")}
            maxLength={500}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("email")} htmlFor="spokesperson-email">
          <Input
            id="spokesperson-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label={t("phone")} htmlFor="spokesperson-phone">
          <Input
            id="spokesperson-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={60}
          />
        </Field>
      </div>

      <Field label={t("bio")} htmlFor="spokesperson-bio" hint={t("bioHint")}>
        <Textarea
          id="spokesperson-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={2000}
        />
      </Field>

      <Field label={t("mediaTrained")} htmlFor="spokesperson-media-trained">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            id="spokesperson-media-trained"
            type="checkbox"
            checked={mediaTrained}
            onChange={(e) => setMediaTrained(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          {t("mediaTrainedLabel")}
        </label>
      </Field>

      <Field label={tCommon("notes")} htmlFor="spokesperson-notes">
        <Textarea
          id="spokesperson-notes"
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
