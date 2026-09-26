import {
  clubDate,
  clubMinutes,
  formatDay,
  formatTime,
  toMinutes,
  weekdayOf,
  type ClockTime,
  type IsoDate,
} from "./dates";

export type Season = {
  name: string;
  openingDay: IsoDate;
  closingDay: IsoDate;
};

/** Hours for one weekday (0 = Sunday). A weekday with no entry is closed. */
export type DayHours = {
  weekday: number;
  open: ClockTime;
  close: ClockTime;
};

/** A run of dates that share the same weekly hours, e.g. "Opening week". */
export type HoursSchedule = {
  label: string;
  startsOn: IsoDate;
  endsOn: IsoDate;
  days: DayHours[];
};

export type PoolStatus =
  | { state: "open"; headline: string }
  | { state: "opens-later"; headline: string }
  | { state: "closed-today"; headline: string }
  | { state: "preseason"; headline: string }
  | { state: "offseason"; headline: string };

export function hoursOn(date: IsoDate, schedules: HoursSchedule[]): DayHours | undefined {
  const schedule = schedules.find((s) => s.startsOn <= date && date <= s.endsOn);
  return schedule?.days.find((d) => d.weekday === weekdayOf(date));
}

export function poolStatus(now: Date, season: Season, schedules: HoursSchedule[]): PoolStatus {
  const today = clubDate(now);

  if (today < season.openingDay) {
    return { state: "preseason", headline: `Opens ${formatDay(season.openingDay)}` };
  }
  if (today > season.closingDay) {
    return { state: "offseason", headline: "Closed for the season" };
  }

  const hours = hoursOn(today, schedules);
  if (!hours) {
    return { state: "closed-today", headline: "Closed today" };
  }

  const minutes = clubMinutes(now);
  if (minutes < toMinutes(hours.open)) {
    return { state: "opens-later", headline: `Opens today at ${formatTime(hours.open)}` };
  }
  if (minutes < toMinutes(hours.close)) {
    return { state: "open", headline: `Open now until ${formatTime(hours.close)}` };
  }
  return { state: "closed-today", headline: "Closed for the day" };
}
