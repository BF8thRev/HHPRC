import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../../db/client";
import { documents } from "../../db/schema";

export const MAX_BYTES = 10 * 1024 * 1024;

/** What board members can upload, and the label the site shows for each. */
export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "image/jpeg": "Photo",
  "image/png": "Photo",
  "image/webp": "Photo",
};

const uploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the document a title, like “Club rules 2027”.")
    .max(100, "Keep the title under 100 characters."),
  file: z
    .instanceof(File, { message: "Choose a file to upload." })
    .refine((f) => f.size > 0, "Choose a file to upload.")
    .refine((f) => f.size <= MAX_BYTES, "That file is over 10 MB. Try a smaller PDF.")
    .refine((f) => f.type in ALLOWED_TYPES, "Upload a PDF, Word file or photo."),
});

export type DocumentRow = typeof documents.$inferSelect;
export type UploadResult = { ok: true; title: string } | { ok: false; error: string };

/** Keeps letters, numbers, dots and dashes so the stored name is safe in a URL. */
export function safeFilename(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return cleaned.slice(-80) || "document";
}

export async function uploadDocument(
  env: Pick<Env, "DB" | "DOCS">,
  form: FormData,
  uploadedBy: string,
  now = new Date(),
): Promise<UploadResult> {
  const parsed = uploadSchema.safeParse({ title: form.get("title"), file: form.get("file") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };

  const { title, file } = parsed.data;
  const id = crypto.randomUUID();
  const filename = safeFilename(file.name);
  const key = `docs/${id}/${filename}`;

  await env.DOCS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  await getDb(env.DB).insert(documents).values({
    id,
    title,
    key,
    filename,
    contentType: file.type,
    size: file.size,
    uploadedBy,
    uploadedAt: now,
  });
  return { ok: true, title };
}

export async function deleteDocument(env: Pick<Env, "DB" | "DOCS">, id: string) {
  const db = getDb(env.DB);
  const row = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!row) return false;
  await env.DOCS.delete(row.key);
  await db.delete(documents).where(eq(documents.id, id));
  return true;
}

export function listDocuments(d1: D1Database) {
  return getDb(d1).select().from(documents).orderBy(desc(documents.uploadedAt)).all();
}

export function getDocument(d1: D1Database, id: string) {
  return getDb(d1).select().from(documents).where(eq(documents.id, id)).get();
}

/** "2.4 MB", "340 KB" */
export function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The public address of an uploaded document. */
export const documentHref = (row: Pick<DocumentRow, "id" | "filename">) =>
  `/files/${row.id}/${row.filename}`;
