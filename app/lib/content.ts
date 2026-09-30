import { eq } from "drizzle-orm";

import { getDb } from "../../db/client";
import { siteContent } from "../../db/schema";
import { defaults, sections, type Content, type SectionKey } from "../content/blocks";

/**
 * The board's saved version of a section, or the built-in sample if nothing was
 * saved (or what was saved no longer passes the schema, so a bad row can never
 * break a public page).
 */
export async function getContent<K extends SectionKey>(
  d1: D1Database,
  key: K,
): Promise<Content[K]> {
  const row = await getDb(d1).select().from(siteContent).where(eq(siteContent.key, key)).get();
  if (!row) return defaults[key];
  try {
    const parsed = sections[key].safeParse(JSON.parse(row.json));
    return parsed.success ? (parsed.data as Content[K]) : defaults[key];
  } catch {
    return defaults[key];
  }
}

export async function getContentMeta(d1: D1Database, key: SectionKey) {
  const row = await getDb(d1).select().from(siteContent).where(eq(siteContent.key, key)).get();
  return row ? { updatedAt: row.updatedAt, updatedBy: row.updatedBy } : null;
}

export async function saveContent<K extends SectionKey>(
  d1: D1Database,
  key: K,
  value: unknown,
  email: string,
  now = new Date(),
) {
  const parsed = sections[key].safeParse(value);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message } as const;
  const json = JSON.stringify(parsed.data);
  await getDb(d1)
    .insert(siteContent)
    .values({ key, json, updatedAt: now, updatedBy: email })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { json, updatedAt: now, updatedBy: email },
    });
  return { ok: true } as const;
}

/** Undo all edits to a section and go back to the built-in version. */
export async function resetContent(d1: D1Database, key: SectionKey) {
  await getDb(d1).delete(siteContent).where(eq(siteContent.key, key));
}
