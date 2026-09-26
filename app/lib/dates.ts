// All club dates and times are shown in America/New_York, regardless of where
// the server (UTC) or the visitor happens to be.
export const CLUB_TZ = "America/New_York";

/** A calendar date like "2027-05-29". */
export type IsoDate = string;
/** A wall-clock time like "11:00" or "20:30" (24-hour). */
export type ClockTime = string;

const dateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: CLUB_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partsOf(instant: Date) {
  const parts = Object.fromEntries(dateParts.formatToParts(instant).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** The club's calendar date for an instant. */
export function clubDate(instant: Date): IsoDate {
  return partsOf(instant).date;
}

/** Minutes since midnight on the club's clock. */
export function clubMinutes(instant: Date): number {
  return partsOf(instant).minutes;
}

/** 0 = Sunday … 6 = Saturday, for a calendar date. */
export function weekdayOf(date: IsoDate): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function toMinutes(time: ClockTime): number {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

/** "Saturday, May 29" */
export function formatDay(date: IsoDate): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** "11 AM", "8:30 PM" */
export function formatTime(time: ClockTime): string {
  const total = toMinutes(time);
  const h24 = Math.floor(total / 60);
  const min = total % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${h12} ${suffix}` : `${h12}:${String(min).padStart(2, "0")} ${suffix}`;
}

/** "11 AM to 8 PM" */
export function formatTimeRange(open: ClockTime, close: ClockTime): string {
  return `${formatTime(open)} to ${formatTime(close)}`;
}

/** "Saturday, May 29 at 6 PM" for an instant, in club time. */
export function formatDateTime(instant: Date): string {
  const { date, minutes } = partsOf(instant);
  const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return `${formatDay(date)} at ${formatTime(time)}`;
}
