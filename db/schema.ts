import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Phase 0: a single key/value table to prove the migrate → seed → query
// pipeline end to end. Real tables (seasons, hours_schedules, blocks,
// households, ...) arrive with the phases that need them.
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// "Get club news by email" sign-ups from the public site. Just an address and
// when it arrived; the email phase adds sending and unsubscribe.
export const emailSignups = sqliteTable("email_signups", {
  email: text("email").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  // Set once the address has been passed on to the club's Google Sheet. Null means "still to send".
  syncedAt: integer("synced_at", { mode: "timestamp" }),
});

// Files the board uploads from /board (rules, letters, forms, menus). The file
// itself lives in R2 under `key`; this row is what the site lists.
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  key: text("key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
});

// Content the board edits in /admin: one JSON value per section, validated against
// app/content/blocks.ts on the way in and on the way out. Missing rows fall back to sample.ts.
export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(),
  json: text("json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
});

// Ideas, questions and issues from the public form. Only the feedback owner can read these.
export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(), // idea | question | issue
  message: text("message").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  handledAt: integer("handled_at", { mode: "timestamp" }),
});

// One row per club season. The newest opening day is the "current" season. Dues
// amounts and dates live here, never in code. Money is stored in integer cents.
export const seasons = sqliteTable("seasons", {
  name: text("name").primaryKey(), // "2027"
  openingDay: text("opening_day").notNull(), // YYYY-MM-DD, club time
  openingTime: text("opening_time").notNull(), // HH:MM, club time
  closingDay: text("closing_day").notNull(),
  duesCents: integer("dues_cents").notNull(),
  duesDueOn: text("dues_due_on").notNull(),
  lateFeeCents: integer("late_fee_cents").notNull(),
  statementsMailed: text("statements_mailed").notNull(), // month name
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
});

// Weekly pool hours for a run of dates in a season. `days_json` holds
// [{ weekday: 0-6, open: "12:00", close: "19:00" }]; a weekday with no entry is closed.
export const hoursSchedules = sqliteTable("hours_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonName: text("season_name")
    .notNull()
    .references(() => seasons.name, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  label: text("label").notNull(),
  startsOn: text("starts_on").notNull(),
  endsOn: text("ends_on").notNull(),
  daysJson: text("days_json").notNull(),
});
