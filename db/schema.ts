import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Phase 0: a single key/value table to prove the migrate → seed → query
// pipeline end to end. Real tables (seasons, hours_schedules, blocks,
// households, ...) arrive with the phases that need them.
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
