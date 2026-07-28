"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Trash2 } from "lucide-react";
import { AttachmentIcon } from "./ui/attachment-icon";
import { formatFileSize } from "@/lib/goal-helpers";
import { api } from "@/lib/api-client";
import type { Attachment } from "@/lib/types";

export function AttachmentSection({
  subtaskId,
  attachments,
  onAttachmentsChange,
}: {
  subtaskId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}) {
  const t = useTranslations("Attachments");
  const tCommon = useTranslations("Common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const created = await api.uploadAttachment<Attachment>(subtaskId, file);
      onAttachmentsChange([...attachments, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteAttachment(id);
      onAttachmentsChange(attachments.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mb-4">
      <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">{t("title")}</p>

      {attachments.length === 0 && (
        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">{t("noAttachments")}</p>
      )}

      {attachments.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700"
            >
              <AttachmentIcon
                mimeType={attachment.mimeType}
                className="h-4 w-4 shrink-0 text-slate-400"
              />
              <a
                href={`/api/attachments/${attachment.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-slate-700 hover:text-teal-700 hover:underline dark:text-slate-300 dark:hover:text-teal-400"
              >
                {attachment.filename}
              </a>
              <span className="shrink-0 text-xs text-slate-400">
                {formatFileSize(attachment.size)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(attachment.id)}
                disabled={deletingId === attachment.id}
                aria-label={tCommon("delete")}
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Upload className="h-4 w-4" />
        {uploading ? t("uploading") : t("upload")}
      </button>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
