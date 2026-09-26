// Usage:
//   pnpm db:seed --env local [--admin-email you@example.com]
//   pnpm db:seed --env preview
//   pnpm db:seed --env prod --admin-email you@example.com --confirm
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { buildSeedSql, seedOptionsSchema, wranglerArgs } from "./seed-sql";

const { values } = parseArgs({
  options: {
    env: { type: "string", default: "local" },
    "admin-email": { type: "string" },
    confirm: { type: "boolean", default: false },
  },
});

const parsed = seedOptionsSchema.safeParse({
  env: values.env,
  adminEmail: values["admin-email"],
  confirm: values.confirm,
});

if (!parsed.success) {
  console.error(
    parsed.error.issues.map((i) => `${i.path.join(".") || "args"}: ${i.message}`).join("\n"),
  );
  process.exit(1);
}

const opts = parsed.data;
const outDir = join(import.meta.dirname, "seed-output");
const file = join(outDir, `seed-${opts.env}.sql`);

mkdirSync(outDir, { recursive: true });
writeFileSync(file, buildSeedSql(opts));

console.log(`Seeding ${opts.env} from ${file}`);
const wrangler = join(import.meta.dirname, "..", "node_modules", "wrangler", "bin", "wrangler.js");
execFileSync(process.execPath, [wrangler, ...wranglerArgs(opts.env, file)], { stdio: "inherit" });
