import { club } from "../content/sample";
import { getContent } from "../lib/content";
import { clubDate } from "../lib/dates";
import type { Route } from "./+types/meeting-ics";

// "Add to my calendar" for the members meeting. Until the board confirms the
// time it's an all-day entry, so nobody's calendar shows a made-up hour.

/** Calendar text escapes commas, semicolons and backslashes. */
const escape = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`);

export async function loader({ context }: Route.LoaderArgs) {
  const membersMeeting = await getContent(context.cloudflare.env.DB, "meeting");
  const start = new Date(membersMeeting.startsAt);
  const date = clubDate(start).replaceAll("-", "");
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const when = membersMeeting.timeConfirmed
    ? [`DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 2 * 60 * 60 * 1000))}`]
    : [`DTSTART;VALUE=DATE:${date}`];

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//hhprc.club//Members meeting//EN",
    "BEGIN:VEVENT",
    `UID:members-meeting-${date}@hhprc.club`,
    `DTSTAMP:${stamp(new Date())}`,
    ...when,
    `SUMMARY:${club.shortName} ${membersMeeting.title.toLowerCase()}`,
    `LOCATION:${membersMeeting.place}\\, ${membersMeeting.town}\\, NY`,
    `DESCRIPTION:${escape(membersMeeting.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hhprc-members-meeting.ics"',
    },
  });
}
