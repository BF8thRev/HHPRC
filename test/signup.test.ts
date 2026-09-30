import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import { syncSignups } from "../app/lib/gmail-sync";
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
    expect(await signUp(env, form({ email: "  Pat@Example.com " }))).toEqual({ ok: true });
    expect(await signUp(env, form({ email: "pat@example.com" }))).toEqual({ ok: true });
    expect(await saved()).toEqual(["pat@example.com"]);
  });

  it("explains a bad address and saves nothing", async () => {
    const result = await signUp(env, form({ email: "not-an-email" }));
    expect(result.ok).toBe(false);
    expect(await saved()).toEqual([]);
  });

  it("quietly drops bot submissions that fill the hidden field", async () => {
    const result = await signUp(env, form({ email: "bot@example.com", website: "spam" }));
    expect(result).toEqual({ ok: true });
    expect(await saved()).toEqual([]);
  });
});

describe("signUp hand-off to Google", () => {
  beforeEach(async () => {
    await env.DB.exec("delete from email_signups");
  });
  const hooked = {
    ...env,
    SIGNUP_WEBHOOK_URL: "https://script.test/exec",
    SIGNUP_WEBHOOK_SECRET: "s3cret",
  };
  const answer = (res: () => Response) => (async () => res()) as unknown as typeof fetch;
  const syncedAt = async () =>
    (await env.DB.prepare("select synced_at from email_signups").first())?.synced_at;

  it("forwards the address and marks it sent when Google confirms", async () => {
    let body = "";
    const fetcher = (async (_url: string, init: RequestInit) => {
      body = String(init.body);
      return Response.json({ ok: true });
    }) as unknown as typeof fetch;
    await signUp(hooked, form({ email: "pat@example.com" }), new Date(), fetcher);
    expect(JSON.parse(body)).toMatchObject({ email: "pat@example.com", secret: "s3cret" });
    expect(await syncedAt()).not.toBeNull();
  });

  it("keeps the address if Google is down, and the retry sends it once", async () => {
    const down = answer(() => new Response("no", { status: 500 }));
    const form1 = form({ email: "pat@example.com" });
    expect(await signUp(hooked, form1, new Date(), down)).toEqual({ ok: true });
    expect(await syncedAt()).toBeNull();

    const up = answer(() => Response.json({ ok: true }));
    expect(await syncSignups(hooked, up)).toEqual({ pending: 1, sent: 1 });
    expect(await syncSignups(hooked, up)).toEqual({ pending: 0, sent: 0 });
  });
});
