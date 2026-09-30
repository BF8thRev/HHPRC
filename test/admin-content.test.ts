import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import { defaults } from "../app/content/blocks";
import { fromForm, toRows } from "../app/lib/admin-forms";
import { getContent, resetContent, saveContent } from "../app/lib/content";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

describe("site content", () => {
  beforeEach(async () => {
    await env.DB.exec("delete from site_content");
  });

  it("falls back to the starter content until something is saved", async () => {
    expect(await getContent(env.DB, "events")).toEqual(defaults.events);
  });

  it("saves, reads back and resets a section", async () => {
    const events = [
      {
        title: "Pizza night",
        startsAt: "2027-07-09T23:00:00.000Z",
        location: "Pool",
        description: "Bring a chair.",
        kind: "event",
      },
    ];
    expect(await saveContent(env.DB, "events", events, "a@b.co")).toEqual({ ok: true });
    expect(await getContent(env.DB, "events")).toEqual(events);
    await resetContent(env.DB, "events");
    expect(await getContent(env.DB, "events")).toEqual(defaults.events);
  });

  it("refuses content that fails its block schema", async () => {
    const bad = [{ title: "x", body: "y", nextStep: { label: "Go", href: "javascript:alert(1)" } }];
    const result = await saveContent(env.DB, "announcements", bad, "a@b.co");
    expect(result.ok).toBe(false);
    expect(await getContent(env.DB, "announcements")).toEqual(defaults.announcements);
  });

  it("ignores a stored row that no longer passes the schema", async () => {
    await env.DB.prepare(
      "insert into site_content (key, json, updated_at, updated_by) values ('rules', ?, 0, 'x')",
    )
      .bind(JSON.stringify([{ oops: 1 }]))
      .run();
    expect(await getContent(env.DB, "rules")).toEqual(defaults.rules);
  });
});

describe("admin form conversion", () => {
  it("turns club-time date and time fields into the right instant, across daylight saving", () => {
    const summer = fromForm(
      "events",
      form({
        "0.title": "Opening",
        "0.date": "2027-05-29",
        "0.time": "12:00",
        "0.location": "Pool",
        "0.description": "Hi",
        "0.kind": "event",
      }),
    );
    expect(summer).toMatchObject({ ok: true, value: [{ startsAt: "2027-05-29T16:00:00.000Z" }] });
    const winter = fromForm(
      "meeting",
      form({
        "0.title": "Meeting",
        "0.date": "2027-02-26",
        "0.time": "19:00",
        "0.place": "Library",
        "0.town": "Dix Hills",
        "0.description": "Hi",
      }),
    );
    expect(winter).toMatchObject({ ok: true, value: { startsAt: "2027-02-27T00:00:00.000Z" } });
  });

  it("round-trips saved events into form rows", () => {
    const rows = toRows("events", defaults.events);
    expect(rows[0]).toMatchObject({ title: "Opening weekend", date: "2027-05-29", time: "12:00" });
  });

  it("removes a row whose title is cleared and asks for a date when one is missing", () => {
    const cleared = fromForm("announcements", form({ "0.title": "", "0.body": "x" }));
    expect(cleared).toEqual({ ok: true, value: [] });
    const nodate = fromForm("events", form({ "0.title": "Picnic" }));
    expect(nodate.ok).toBe(false);
  });

  it("saves a rules heading's lines as separate rules", () => {
    const r = fromForm("rules", form({ "0.title": "At the pool", "0.items": "One\n\n Two \n" }));
    expect(r).toEqual({
      ok: true,
      value: [{ id: "at-the-pool", title: "At the pool", items: ["One", "Two"] }],
    });
  });
});
