import { applyD1Migrations, env, type D1Migration } from "cloudflare:test";

// TEST_MIGRATIONS is injected by vitest.config.ts and only exists under test.
const { TEST_MIGRATIONS } = env as Env & { TEST_MIGRATIONS: D1Migration[] };

await applyD1Migrations(env.DB, TEST_MIGRATIONS);
