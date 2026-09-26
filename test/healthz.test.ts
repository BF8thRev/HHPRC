import { createExecutionContext, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { loader } from "../app/routes/healthz";

type LoaderArgs = Parameters<typeof loader>[0];

function callLoader(db: D1Database) {
  const context = { cloudflare: { env: { ...env, DB: db }, ctx: createExecutionContext() } };
  return loader({ context } as unknown as LoaderArgs);
}

describe("/healthz", () => {
  it("reports ok when D1 answers", async () => {
    const res = await callLoader(env.DB);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, db: "ok" });
  });

  it("returns 503 when D1 fails", async () => {
    const broken = {
      prepare: () => ({
        first: () => Promise.reject(new Error("down")),
      }),
    } as unknown as D1Database;
    const res = await callLoader(broken);
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, db: "error" });
  });
});
