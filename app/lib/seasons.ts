// The current season (dates and dues) and its weekly pool hours. These live in their own
// tables, not in site_content, because dues and payments build on them. A saved row that
// no longer passes its schema is ignored so a bad row can never break a public page.
import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "../../db/client";
import { hoursSchedules, seasons } from "../../db/schema";
import { defaults, scheduleSchema, seasonSchema, sections, type Content } from "../content/blocks";

type SeasonRow = typeof seasons.$inferSelect;

async function currentRow(d1: D1Database): Promise<SeasonRow | undefined> {
  const rows = await getDb(d1)
    .select()
    .from(seasons)
    .orderBy(desc(seasons.openingDay), desc(seasons.updatedAt));
  return rows.find((r) => seasonSchema.safeParse(r).success);
}

/** The newest season the board saved, or the starter season. */
export async function getSeason(d1: D1Database): Promise<Content["season"]> {
  const row = await currentRow(d1);
  if (!row) return defaults.season;
  return seasonSchema.parse(row);
}

export async function getSeasonMeta(d1: D1Database) {
  const row = await currentRow(d1);
  return row ? { updatedAt: row.updatedAt, updatedBy: row.updatedBy } : null;
}

/** Weekly hours for the current season, or the starter hours if none were saved. */
export async function getHours(d1: D1Database): Promise<Content["hours"]> {
  const row = await currentRow(d1);
  if (!row) return defaults.hours;
  const saved = await getDb(d1)
    .select()
    .from(hoursSchedules)
    .where(eq(hoursSchedules.seasonName, row.name))
    .orderBy(asc(hoursSchedules.position));
  const parsed = saved.map((s) => {
    try {
      return scheduleSchema.safeParse({ ...s, days: JSON.parse(s.daysJson) });
    } catch {
      return { success: false } as const;
    }
  });
  if (saved.length === 0 || parsed.some((p) => !p.success)) return defaults.hours;
  return parsed.map((p) => (p as { data: Content["hours"][number] }).data);
}

/** Saving with a new name starts a new season and keeps the old one. */
export async function saveSeason(d1: D1Database, value: unknown, email: string, now = new Date()) {
  const parsed = sections.season.safeParse(value);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message } as const;
  await getDb(d1)
    .insert(seasons)
    .values({ ...parsed.data, updatedAt: now, updatedBy: email })
    .onConflictDoUpdate({
      target: seasons.name,
      set: { ...parsed.data, updatedAt: now, updatedBy: email },
    });
  return { ok: true } as const;
}

export async function saveHours(d1: D1Database, value: unknown, email: string, now = new Date()) {
  const parsed = sections.hours.safeParse(value);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message } as const;

  // Hours belong to a season, so make sure the current season has a row to hang them on.
  const season = await getSeason(d1);
  const db = getDb(d1);
  await db
    .insert(seasons)
    .values({ ...season, updatedAt: now, updatedBy: email })
    .onConflictDoNothing();

  const clear = db.delete(hoursSchedules).where(eq(hoursSchedules.seasonName, season.name));
  const rows = parsed.data.map((s, position) => ({
    seasonName: season.name,
    position,
    label: s.label,
    startsOn: s.startsOn,
    endsOn: s.endsOn,
    daysJson: JSON.stringify(s.days),
  }));
  await db.batch([clear, db.insert(hoursSchedules).values(rows)]);
  await db
    .update(seasons)
    .set({ updatedAt: now, updatedBy: email })
    .where(eq(seasons.name, season.name));
  return { ok: true } as const;
}

/** Go back to the starter hours. The season and its dues are left alone. */
export async function resetHours(d1: D1Database) {
  const row = await currentRow(d1);
  if (row) await getDb(d1).delete(hoursSchedules).where(eq(hoursSchedules.seasonName, row.name));
}
