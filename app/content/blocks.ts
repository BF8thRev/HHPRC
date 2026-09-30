// The fixed block types the board can edit in /admin. Editors change words and
// dates; they can't change layout, colors or fonts. Every saved value is checked
// against these schemas when it is written and again when it is read.
import { z } from "zod";

import { announcements, events, membersMeeting, rules } from "./sample";

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

export const sections = {
  announcements: z.array(announcementSchema).max(8),
  events: z.array(eventSchema).max(60),
  meeting: meetingSchema,
  rules: z.array(ruleSectionSchema).max(12),
} as const;

export type SectionKey = keyof typeof sections;
export type Content = { [K in SectionKey]: z.infer<(typeof sections)[K]> };
export const sectionKeys = Object.keys(sections) as SectionKey[];
export const isSectionKey = (key: string): key is SectionKey => key in sections;

/** What the public site shows until the board saves something. */
export const defaults: Content = {
  announcements,
  events,
  meeting: membersMeeting,
  rules,
};
