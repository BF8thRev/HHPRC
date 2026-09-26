import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { buildSeedSql, seedOptionsSchema, wranglerArgs } from "../db/seed-sql";

describe("seed options", () => {
  it("refuses prod without --confirm", () => {
    const result = seedOptionsSchema.safeParse({ env: "prod" });
    expect(result.success).toBe(false);
  });

  it("accepts prod with --confirm", () => {
    expect(seedOptionsSchema.safeParse({ env: "prod", confirm: true }).success).toBe(true);
  });

  it("rejects a malformed admin email and lowercases a valid one", () => {
    expect(seedOptionsSchema.safeParse({ env: "local", adminEmail: "nope" }).success).toBe(false);
    const ok = seedOptionsSchema.parse({ env: "local", adminEmail: "Board@Example.com" });
    expect(ok.adminEmail).toBe("board@example.com");
  });
});

describe("wranglerArgs", () => {
  it("targets the right database for each environment", () => {
    expect(wranglerArgs("local", "s.sql")).toContain("--local");
    expect(wranglerArgs("preview", "s.sql")).toEqual(
      expect.arrayContaining(["--remote", "--env", "preview"]),
    );
    expect(wranglerArgs("prod", "s.sql")).not.toContain("--env");
  });
});

describe("buildSeedSql", () => {
  it("runs against D1, is idempotent and escapes quotes", async () => {
    const opts = seedOptionsSchema.parse({ env: "local", adminEmail: "o'brien@example.com" });
    const sql = buildSeedSql(opts, new Date("2026-05-23T12:00:00Z"));

    // Running twice must not fail or duplicate rows.
    await env.DB.exec(sql.replaceAll("\n", " "));
    await env.DB.exec(sql.replaceAll("\n", " "));

    const { results } = await env.DB.prepare("select key, value from app_meta order by key").all();
    expect(results).toEqual([
      { key: "pending_first_admin", value: "o'brien@example.com" },
      { key: "seeded_at", value: "2026-05-23T12:00:00.000Z" },
    ]);
  });
});
