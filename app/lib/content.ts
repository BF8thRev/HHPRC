import { eq } from "drizzle-orm";

import { getDb } from "../../db/client";
import { siteContent } from "../../db/schema";
import { defaults, sections, type Content, type SectionKey } from "../content/blocks";
import { getHours, getSeason, getSeasonMeta, resetHours, saveHours, saveSeason } from "./seasons";

/**
 * The board's saved version of a section, or the built-in sample if nothing was
 * saved (or what was saved no longer passes the schema, so a bad row can never
 * break a public page). Season and hours come from their own tables.
 */
export async function getContent<K extends SectionKey>(
  d1: D1Database,
  key: K,
): Promise<Content[K]> {
  if (key === "season") return (await getSeason(d1)) as Content[K];
  if (key === "hours") return (await getHours(d1)) as Content[K];

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
  if (key === "season" || key === "hours") return getSeasonMeta(d1);
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
  if (key === "season") return saveSeason(d1, value, email, now);
  if (key === "hours") return saveHours(d1, value, email, now);

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

/** Undo all edits to a section and go back to the built-in version. Not offered for the season. */
export async function resetContent(d1: D1Database, key: SectionKey) {
  if (key === "season") return;
  if (key === "hours") return resetHours(d1);
  await getDb(d1).delete(siteContent).where(eq(siteContent.key, key));
}
