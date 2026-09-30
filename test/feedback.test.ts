import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import { requireFeedbackOwner } from "../app/lib/access";
import { listFeedback, submitFeedback } from "../app/lib/feedback";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

describe("submitFeedback", () => {
  beforeEach(async () => {
    await env.DB.exec("delete from feedback");
  });

  it("saves a note, with name and email optional", async () => {
    const ok = await submitFeedback(env.DB, form({ kind: "idea", message: "More shade please" }));
    expect(ok).toEqual({ ok: true });
    const [row] = await listFeedback(env.DB);
    expect(row).toMatchObject({
      kind: "idea",
      message: "More shade please",
      name: null,
      email: null,
    });
  });

  it("explains what to fix and saves nothing", async () => {
    const bad = await submitFeedback(env.DB, form({ kind: "idea", message: "hi" }));
    expect(bad.ok).toBe(false);
    const badEmail = await submitFeedback(
      env.DB,
      form({ kind: "issue", message: "The gate sticks", email: "nope" }),
    );
    expect(badEmail.ok).toBe(false);
    expect(await listFeedback(env.DB)).toHaveLength(0);
  });

  it("quietly drops bot submissions", async () => {
    const r = await submitFeedback(
      env.DB,
      form({ kind: "idea", message: "buy pills now", website: "spam" }),
    );
    expect(r).toEqual({ ok: true });
    expect(await listFeedback(env.DB)).toHaveLength(0);
  });
});

describe("requireFeedbackOwner", () => {
  const base = { APP_ENV: "development", ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "" } as const;
  const req = new Request("https://x.test/admin/inbox");

  it("lets only the owner in; other board members get a 403", async () => {
    const owner = {
      ...base,
      DEV_BOARD_EMAIL: "Owner@Example.com",
      FEEDBACK_OWNER_EMAIL: "owner@example.com",
    };
    expect(await requireFeedbackOwner(req, owner)).toBe("owner@example.com");

    const other = { ...owner, DEV_BOARD_EMAIL: "other@example.com" };
    await expect(requireFeedbackOwner(req, other)).rejects.toMatchObject({ status: 403 });
  });

  it("denies everyone if no owner is configured", async () => {
    const none = { ...base, DEV_BOARD_EMAIL: "a@b.co", FEEDBACK_OWNER_EMAIL: "" };
    await expect(requireFeedbackOwner(req, none)).rejects.toMatchObject({ status: 403 });
  });
});
