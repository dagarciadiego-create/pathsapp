"use client";

import { useTranslations } from "next-intl";
import { Modal } from "./modal";
import { Button } from "./form";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  pending,
  title,
  body,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  title?: string;
  body?: string;
}) {
  const t = useTranslations("Common");

  return (
    <Modal open={open} onClose={onClose} title={title ?? t("confirmDeleteTitle")}>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
        {body ?? t("confirmDeleteBody")}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? t("saving") : t("delete")}
        </Button>
      </div>
    </Modal>
  );
}
