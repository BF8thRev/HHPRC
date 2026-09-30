import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import { defaults } from "../app/content/blocks";
import { centsToText, fromForm, textToCents, toRows } from "../app/lib/admin-forms";
import { getContent, resetContent, saveContent } from "../app/lib/content";
import { buildMilestones, statementsDate } from "../app/lib/milestones";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

const nextSeason = {
  ...defaults.season,
  name: "2028",
  openingDay: "2028-05-27",
  closingDay: "2028-09-04",
  duesCents: 85_000,
  duesDueOn: "2028-04-30",
};

describe("season and hours tables", () => {
  beforeEach(async () => {
    await env.DB.exec("delete from hours_schedules");
    await env.DB.exec("delete from seasons");
  });

  it("shows the starter season and hours until something is saved", async () => {
    expect(await getContent(env.DB, "season")).toEqual(defaults.season);
    expect(await getContent(env.DB, "hours")).toEqual(defaults.hours);
  });

  it("saves dues in cents and reads them back", async () => {
    expect(await saveContent(env.DB, "season", nextSeason, "a@b.co")).toEqual({ ok: true });
    expect(await getContent(env.DB, "season")).toEqual(nextSeason);
  });

  it("keeps the old season when a new name is saved, and uses the newest", async () => {
    await saveContent(env.DB, "season", defaults.season, "a@b.co");
    await saveContent(env.DB, "season", nextSeason, "a@b.co");
    const { results } = await env.DB.prepare("select name from seasons order by name").all();
    expect(results.map((r) => r.name)).toEqual(["2027", "2028"]);
    expect((await getContent(env.DB, "season")).name).toBe("2028");
  });

  it("refuses a season that ends before it opens, or a negative fee", async () => {
    const backwards = { ...nextSeason, closingDay: "2028-05-01" };
    expect((await saveContent(env.DB, "season", backwards, "a@b.co")).ok).toBe(false);
    expect(
      (await saveContent(env.DB, "season", { ...nextSeason, lateFeeCents: -1 }, "a@b.co")).ok,
    ).toBe(false);
    expect(await getContent(env.DB, "season")).toEqual(defaults.season);
  });

  it("saves hours against the current season, then resets to the starter hours", async () => {
    const hours = [
      {
        label: "Summer",
        startsOn: "2027-06-01",
        endsOn: "2027-08-31",
        days: [{ weekday: 6, open: "10:00", close: "18:00" }],
      },
    ];
    expect(await saveContent(env.DB, "hours", hours, "a@b.co")).toEqual({ ok: true });
    expect(await getContent(env.DB, "hours")).toEqual(hours);
    // The season row was created for them, with the starter dues untouched.
    expect(await getContent(env.DB, "season")).toEqual(defaults.season);

    await resetContent(env.DB, "hours");
    expect(await getContent(env.DB, "hours")).toEqual(defaults.hours);
  });

  it("refuses hours that close before they open or list a day twice", async () => {
    const day = { weekday: 1, open: "19:00", close: "12:00" };
    const base = { label: "X", startsOn: "2027-06-01", endsOn: "2027-06-30" };
    expect((await saveContent(env.DB, "hours", [{ ...base, days: [day] }], "a@b.co")).ok).toBe(
      false,
    );
    const twice = { weekday: 1, open: "12:00", close: "19:00" };
    expect(
      (await saveContent(env.DB, "hours", [{ ...base, days: [twice, twice] }], "a@b.co")).ok,
    ).toBe(false);
    expect((await saveContent(env.DB, "hours", [], "a@b.co")).ok).toBe(false);
  });

  it("never resets the season", async () => {
    await saveContent(env.DB, "season", nextSeason, "a@b.co");
    await resetContent(env.DB, "season");
    expect((await getContent(env.DB, "season")).name).toBe("2028");
  });
});

describe("dues and hours forms", () => {
  it("turns dollars into cents and back", () => {
    expect(textToCents("825")).toBe(82_500);
    expect(textToCents("$1,050.5")).toBe(105_050);
    expect(textToCents("825.50")).toBe(82_550);
    expect(textToCents("abc")).toBeNull();
    expect(textToCents("12.345")).toBeNull();
    expect(centsToText(82_500)).toBe("825");
    expect(centsToText(82_550)).toBe("825.50");
  });

  it("reads the season form into cents", () => {
    const r = fromForm(
      "season",
      form({
        "0.name": "2028",
        "0.openingDay": "2028-05-27",
        "0.openingTime": "12:00",
        "0.closingDay": "2028-09-04",
        "0.duesDollars": "850",
        "0.duesDueOn": "2028-04-30",
        "0.lateFeeDollars": "100",
        "0.statementsMailed": "March",
      }),
    );
    expect(r).toMatchObject({ ok: true, value: { duesCents: 85_000, lateFeeCents: 10_000 } });
    expect(fromForm("season", form({ "0.name": "2028", "0.duesDollars": "lots" })).ok).toBe(false);
  });

  it("round-trips the starter hours through the form, leaving closed days empty", () => {
    const rows = toRows("hours", defaults.hours);
    expect(rows[0]).toMatchObject({ label: "Spring weekends", d5o: "15:00", d5c: "19:00" });
    expect(rows[0]!.d1o).toBeUndefined();

    const data = new FormData();
    rows.forEach((row, i) => Object.entries(row).forEach(([k, v]) => data.set(`${i}.${k}`, v)));
    const back = fromForm("hours", data);
    expect(back.ok && (back.value as typeof defaults.hours).map((h) => h.days.length)).toEqual(
      defaults.hours.map((h) => h.days.length),
    );
  });

  it("asks for both times when only one is filled in", () => {
    const r = fromForm(
      "hours",
      form({
        "0.label": "Summer",
        "0.startsOn": "2027-06-01",
        "0.endsOn": "2027-08-31",
        "0.d1o": "12:00",
      }),
    );
    expect(r).toEqual({
      ok: false,
      error: "Summer: Monday needs both an opening and a closing time.",
    });
  });
});

describe("milestones", () => {
  it("follows the season, dues and hours the board saved", () => {
    const list = buildMilestones(nextSeason, defaults.hours, defaults.meeting);
    const byLabel = Object.fromEntries(list.map((m) => [m.label, m]));
    expect(byLabel["Dues due"]).toMatchObject({ date: "2028-04-30", detail: "$850 per household" });
    expect(byLabel["Opening day"]!.date).toBe("2028-05-27");
    expect(byLabel["Last swim of summer"]!.date).toBe("2028-09-04");
    expect(list.map((m) => m.date)).toEqual([...list.map((m) => m.date)].sort());
  });

  it("puts the mailing date in the dues year, using the month the board named", () => {
    expect(statementsDate(defaults.season)).toBe("2027-03-01");
    expect(statementsDate({ ...defaults.season, statementsMailed: "february" })).toBe("2027-02-01");
    expect(statementsDate({ ...defaults.season, statementsMailed: "soon" })).toBe("2027-03-01");
  });
});
