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
