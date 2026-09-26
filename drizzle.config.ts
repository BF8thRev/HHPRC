import { defineConfig } from "drizzle-kit";

// drizzle-kit only generates SQL here; Wrangler applies it
// (`pnpm db:migrate:local|preview|prod`) so D1 tracks what has run.
export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./db/migrations",
});
