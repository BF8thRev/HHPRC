// The fixed block types the board can edit in /admin. Editors change words and
// dates; they can't change layout, colors or fonts. Every saved value is checked
// against these schemas when it is written and again when it is read.
import { z } from "zod";

import {
  announcements,
  events,
  hoursNotes,
  hoursSchedules,
  membersMeeting,
  rules,
  season,
} from "./sample";

const text = (max: number, what: string) =>
  z.string().trim().min(1, `Add ${what}.`).max(max, `Keep ${what} under ${max} characters.`);

// Links are either a page on this site ("/events") or a full web or email address.
const link = z
  .string()
  .trim()
  .max(300)
  .refine((v) => /^(\/(?!\/)|https:\/\/|mailto:)/.test(v), {
    message: "Links start with /, https:// or mailto:.",
  });

export const announcementSchema = z.object({
  title: text(80, "a title"),
  body: text(400, "a message"),
  nextStep: z.object({ label: text(60, "button words"), href: link }),
});

export const eventSchema = z.object({
  title: text(80, "a title"),
  startsAt: z.iso.datetime({ offset: true, message: "Pick a date and time." }),
  location: text(80, "a place"),
  description: text(400, "a short description"),
  kind: z.enum(["event", "lesson"]),
});

export const meetingSchema = z.object({
  title: text(80, "a title"),
  startsAt: z.iso.datetime({ offset: true, message: "Pick a date and time." }),
  timeConfirmed: z.boolean(),
  place: text(100, "a place"),
  town: text(60, "a town"),
  description: text(400, "a short description"),
});

export const ruleSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: text(80, "a heading"),
  items: z.array(text(300, "the rule")).min(1).max(20),
});

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Pick a real date.");
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 12:00.");
// Dues and fees are whole cents, so $825 is 82500. Capped at $10,000 to catch typos.
const cents = z.number().int("Use dollars and cents.").min(0).max(1_000_000, "That's too large.");

/** The current season: dates and dues. Stored in the seasons table. */
export const seasonSchema = z
  .object({
    name: text(20, "a season name"),
    openingDay: date,
    openingTime: clock,
    closingDay: date,
    duesCents: cents,
    duesDueOn: date,
    lateFeeCents: cents,
    statementsMailed: text(20, "the month statements are mailed"),
  })
  .refine((s) => s.closingDay >= s.openingDay, {
    message: "The last day can't be before opening day.",
    path: ["closingDay"],
  });

const dayHoursSchema = z
  .object({ weekday: z.number().int().min(0).max(6), open: clock, close: clock })
  .refine((d) => d.close > d.open, "Closing time must be after opening time.");

/** One run of dates with the same weekly hours. Stored in the hours_schedules table. */
export const scheduleSchema = z
  .object({
    label: text(60, "a name, like Full season"),
    startsOn: date,
    endsOn: date,
    days: z.array(dayHoursSchema).max(7),
  })
  .refine((s) => s.endsOn >= s.startsOn, {
    message: "A run of hours can't end before it starts.",
    path: ["endsOn"],
  })
  .refine((s) => new Set(s.days.map((d) => d.weekday)).size === s.days.length, {
    message: "Each weekday can only be listed once.",
    path: ["days"],
  });

export const hoursNotesSchema = z.object({
  lapLanes: text(300, "a note about lap lanes"),
  weekendLessons: text(300, "a note about weekend lessons"),
  weather: text(300, "a note about weather"),
});

export const sections = {
  announcements: z.array(announcementSchema).max(8),
  events: z.array(eventSchema).max(60),
  hours: z.array(scheduleSchema).min(1, "Add at least one set of hours.").max(8),
  hoursNotes: hoursNotesSchema,
  season: seasonSchema,
  meeting: meetingSchema,
  rules: z.array(ruleSectionSchema).max(12),
} as const;

/** Sections kept in their own tables (seasons, hours_schedules) instead of site_content. */
export const tableKeys = ["season", "hours"] as const;

export type SectionKey = keyof typeof sections;
export type Content = { [K in SectionKey]: z.infer<(typeof sections)[K]> };
export const sectionKeys = Object.keys(sections) as SectionKey[];
export const isSectionKey = (key: string): key is SectionKey => key in sections;

/** What the public site shows until the board saves something. */
export const defaults: Content = {
  announcements,
  events,
  hours: hoursSchedules,
  hoursNotes,
  season,
  meeting: membersMeeting,
  rules,
};
