import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { getStore } from "@netlify/blobs";

// On Netlify, attachments live in Netlify Blobs (durable, persists across
// deploys) instead of the local filesystem, which is wiped between
// invocations on Netlify's serverless runtime. `NETLIFY=true` is set by
// Netlify in both the build and the function runtime. Outside of Netlify
// (plain `next dev`, without the Netlify CLI) Blobs has no environment to
// connect to, so local development falls back to disk — this keeps
// `next dev` working without requiring `netlify dev` just to test uploads.
//
// Either way, access always goes through /api/attachments/[id]/file, which
// can add auth checks later without having to move anything on disk or
// in blob storage.
const ON_NETLIFY = process.env.NETLIFY === "true";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function attachmentsStore() {
  // Strong consistency so a file is readable immediately after upload,
  // rather than only eventually — this app reads back what it just wrote.
  return getStore({ name: "attachments", consistency: "strong" });
}

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

function storageKeyFor(file: File) {
  const rawExt = path.extname(file.name).slice(0, 20);
  const ext = /^\.[a-zA-Z0-9]+$/.test(rawExt) ? rawExt : "";
  return `${randomUUID()}${ext}`;
}

export async function saveUploadedFile(file: File) {
  const storageKey = storageKeyFor(file);
  const arrayBuffer = await file.arrayBuffer();

  if (ON_NETLIFY) {
    await attachmentsStore().set(storageKey, arrayBuffer);
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, storageKey), Buffer.from(arrayBuffer));
  }

  return { storageKey, size: arrayBuffer.byteLength };
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  if (!ON_NETLIFY) {
    return readFile(path.join(UPLOAD_DIR, storageKey));
  }
  const data = await attachmentsStore().get(storageKey, { type: "arrayBuffer" });
  if (!data) throw new Error("File missing in blob storage");
  return Buffer.from(data);
}

export async function deleteStoredFile(storageKey: string) {
  if (ON_NETLIFY) {
    await attachmentsStore()
      .delete(storageKey)
      .catch(() => {});
    return;
  }
  await unlink(path.join(UPLOAD_DIR, storageKey)).catch(() => {});
}
