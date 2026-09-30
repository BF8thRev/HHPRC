import { describe, expect, it } from "vitest";

import { countdown } from "../app/lib/countdown";
import { clubInstant, formatShortDay } from "../app/lib/dates";

describe("clubInstant", () => {
  it("reads summer times as EDT (UTC-4)", () => {
    expect(clubInstant("2027-05-29", "12:00").toISOString()).toBe("2027-05-29T16:00:00.000Z");
  });

  it("reads winter times as EST (UTC-5)", () => {
    expect(clubInstant("2027-02-26", "19:00").toISOString()).toBe("2027-02-27T00:00:00.000Z");
  });

  it("gets the day after spring-forward right", () => {
    expect(clubInstant("2027-03-15", "00:30").toISOString()).toBe("2027-03-15T04:30:00.000Z");
  });
});

describe("countdown", () => {
  it("splits the time left into days, hours, minutes and seconds", () => {
    const target = clubInstant("2027-05-29", "12:00").getTime();
    const now = target - (3 * 86_400 + 4 * 3600 + 5 * 60 + 6) * 1000;
    expect(countdown(now, target)).toEqual({ days: 3, hours: 4, minutes: 5, seconds: 6 });
  });

  it("stops at zero once the moment has passed", () => {
    expect(countdown(2_000, 1_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("formatShortDay", () => {
  it("gives the parts for a calendar tile", () => {
    expect(formatShortDay("2027-02-26")).toEqual({ month: "Feb", day: 26, weekday: "Fri" });
  });
});
