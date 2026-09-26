import { describe, expect, it } from "vitest";

import {
  clubDate,
  clubMinutes,
  formatDateTime,
  formatDay,
  formatTime,
  formatTimeRange,
  weekdayOf,
} from "../app/lib/dates";
import { hoursOn, poolStatus, type HoursSchedule, type Season } from "../app/lib/pool-status";

describe("club time", () => {
  it("uses New York's date, not UTC's, late in the evening", () => {
    // 11:30 PM EDT on May 29 is already May 30 in UTC.
    const instant = new Date("2027-05-30T03:30:00Z");
    expect(clubDate(instant)).toBe("2027-05-29");
    expect(clubMinutes(instant)).toBe(23 * 60 + 30);
  });

  it("handles standard time (EST, UTC-5)", () => {
    expect(clubMinutes(new Date("2027-01-15T17:00:00Z"))).toBe(12 * 60);
  });

  it("handles the spring-forward day", () => {
    // 2027-03-14: clocks jump from 2 AM EST to 3 AM EDT.
    expect(clubMinutes(new Date("2027-03-14T06:59:00Z"))).toBe(1 * 60 + 59);
    expect(clubMinutes(new Date("2027-03-14T07:00:00Z"))).toBe(3 * 60);
  });
});

describe("formatting", () => {
  it("formats days as weekday, month and day", () => {
    expect(formatDay("2027-05-29")).toBe("Saturday, May 29");
    expect(weekdayOf("2027-05-29")).toBe(6);
  });

  it("formats times plainly", () => {
    expect(formatTime("11:00")).toBe("11 AM");
    expect(formatTime("12:00")).toBe("12 PM");
    expect(formatTime("00:15")).toBe("12:15 AM");
    expect(formatTime("20:30")).toBe("8:30 PM");
    expect(formatTimeRange("10:00", "20:00")).toBe("10 AM to 8 PM");
  });

  it("formats an instant in club time", () => {
    expect(formatDateTime(new Date("2027-07-04T22:00:00Z"))).toBe("Sunday, July 4 at 6 PM");
  });
});

describe("poolStatus", () => {
  const season: Season = { name: "2027", openingDay: "2027-05-29", closingDay: "2027-09-06" };
  const every = (days: number[], open: string, close: string) =>
    days.map((weekday) => ({ weekday, open, close }));
  const weekly: HoursSchedule[] = [
    // Opening week: short hours, weekdays only.
    {
      label: "Opening week",
      startsOn: "2027-05-29",
      endsOn: "2027-06-01",
      days: every([1, 2, 3, 4, 5], "14:00", "19:00"),
    },
    // Closed Mondays; open 11–8 otherwise.
    {
      label: "Full season",
      startsOn: "2027-06-02",
      endsOn: "2027-09-06",
      days: every([0, 2, 3, 4, 5, 6], "11:00", "20:00"),
    },
  ];
  // Wednesday, June 9, 2027 at the given EDT time.
  const at = (hhmm: string) => new Date(`2027-06-09T${hhmm}:00-04:00`);

  it("announces opening day before the season", () => {
    expect(poolStatus(new Date("2026-09-25T12:00:00Z"), season, weekly)).toEqual({
      state: "preseason",
      headline: "Opens Saturday, May 29",
    });
  });

  it("is closed for the season after closing day", () => {
    expect(poolStatus(new Date("2027-09-07T16:00:00Z"), season, weekly).state).toBe("offseason");
  });

  it("walks through a normal day", () => {
    expect(poolStatus(at("09:00"), season, weekly)).toEqual({
      state: "opens-later",
      headline: "Opens today at 11 AM",
    });
    expect(poolStatus(at("11:00"), season, weekly)).toEqual({
      state: "open",
      headline: "Open now until 8 PM",
    });
    expect(poolStatus(at("20:00"), season, weekly).state).toBe("closed-today");
  });

  it("is closed on a day with no hours", () => {
    expect(poolStatus(new Date("2027-06-07T15:00:00-04:00"), season, weekly)).toEqual({
      state: "closed-today",
      headline: "Closed today",
    });
  });

  it("counts opening and closing day as in season", () => {
    // Opening day is a Saturday with no opening-week hours.
    expect(poolStatus(new Date("2027-05-29T12:00:00-04:00"), season, weekly).state).toBe(
      "closed-today",
    );
    expect(poolStatus(new Date("2027-05-31T15:00:00-04:00"), season, weekly).headline).toBe(
      "Open now until 7 PM",
    );
    expect(poolStatus(new Date("2027-09-06T12:00:00-04:00"), season, weekly).state).toBe(
      "closed-today",
    );
  });
});

describe("hoursOn", () => {
  const schedules: HoursSchedule[] = [
    {
      label: "A",
      startsOn: "2027-06-21",
      endsOn: "2027-06-25",
      days: [{ weekday: 1, open: "14:00", close: "19:00" }],
    },
    {
      label: "B",
      startsOn: "2027-06-26",
      endsOn: "2027-09-06",
      days: [{ weekday: 1, open: "12:00", close: "19:00" }],
    },
  ];

  it("picks the schedule covering the date", () => {
    expect(hoursOn("2027-06-21", schedules)?.open).toBe("14:00");
    expect(hoursOn("2027-06-28", schedules)?.open).toBe("12:00");
  });

  it("returns nothing outside every schedule or on a closed weekday", () => {
    expect(hoursOn("2027-06-20", schedules)).toBeUndefined();
    expect(hoursOn("2027-06-22", schedules)).toBeUndefined();
  });
});
