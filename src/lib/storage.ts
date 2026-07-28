import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

// Uploaded files are stored outside `public/` so they're never served as
// static assets directly — access always goes through
// /api/attachments/[id]/file, which can add auth checks later without
// having to move anything on disk.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

// Allowlist, not a blocklist: only formats a letter/meeting-minutes/photo
// workflow actually needs. Notably excludes text/html and image/svg+xml,
// both of which can execute script if ever rendered inline same-origin.
export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

// Only these are safe to render inline in the browser; everything else is
// forced to download instead (see /api/attachments/[id]/file).
export const INLINE_RENDERABLE_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function saveUploadedFile(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const rawExt = path.extname(file.name).slice(0, 20);
  const ext = /^\.[a-zA-Z0-9]+$/.test(rawExt) ? rawExt : "";
  const storageKey = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storageKey), buffer);
  return { storageKey, size: buffer.byteLength };
}

export async function readStoredFile(storageKey: string) {
  return readFile(path.join(UPLOAD_DIR, storageKey));
}

export async function deleteStoredFile(storageKey: string) {
  await unlink(path.join(UPLOAD_DIR, storageKey)).catch(() => {});
}
