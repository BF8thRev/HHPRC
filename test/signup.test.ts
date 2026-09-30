import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import { signUp } from "../app/lib/signup";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

async function saved() {
  const { results } = await env.DB.prepare("select email from email_signups order by email").all();
  return results.map((r) => r.email);
}

describe("signUp", () => {
  // Each test starts with an empty list.
  beforeEach(async () => {
    await env.DB.exec("delete from email_signups");
  });

  it("saves a trimmed, lowercased address once, even if sent twice", async () => {
    expect(await signUp(env.DB, form({ email: "  Pat@Example.com " }))).toEqual({ ok: true });
    expect(await signUp(env.DB, form({ email: "pat@example.com" }))).toEqual({ ok: true });
    expect(await saved()).toEqual(["pat@example.com"]);
  });

  it("explains a bad address and saves nothing", async () => {
    const result = await signUp(env.DB, form({ email: "not-an-email" }));
    expect(result.ok).toBe(false);
    expect(await saved()).toEqual([]);
  });

  it("quietly drops bot submissions that fill the hidden field", async () => {
    const result = await signUp(env.DB, form({ email: "bot@example.com", website: "spam" }));
    expect(result).toEqual({ ok: true });
    expect(await saved()).toEqual([]);
  });
});
