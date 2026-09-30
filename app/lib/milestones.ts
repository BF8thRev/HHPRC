// The "big dates of the club year" list on the home page, worked out from the season,
// hours and meeting the board edits, so nothing here needs a code change each year.
import type { Content } from "../content/blocks";
import { clubDate, formatTime, type IsoDate } from "./dates";
import { formatCents } from "./money";

export type Milestone = { date: IsoDate; monthOnly?: boolean; label: string; detail: string };

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** The first of the month named in "March", in the dues year. Falls back to March. */
export function statementsDate(season: Content["season"]): IsoDate {
  const found = MONTHS.indexOf(season.statementsMailed.trim().toLowerCase());
  const month = String((found === -1 ? 2 : found) + 1).padStart(2, "0");
  return `${season.duesDueOn.slice(0, 4)}-${month}-01`;
}

export function buildMilestones(
  season: Content["season"],
  hours: Content["hours"],
  meeting: Content["meeting"],
): Milestone[] {
  const meetingAt = new Date(meeting.startsAt);
  const list: Milestone[] = [
    {
      date: clubDate(meetingAt),
      label: meeting.title,
      detail: `${meeting.place}${meeting.timeConfirmed ? "" : ", time to be confirmed"}`,
    },
    {
      date: statementsDate(season),
      monthOnly: true,
      label: "Dues statements mailed",
      detail: `Watch your mailbox in ${season.statementsMailed}`,
    },
    {
      date: season.duesDueOn,
      label: "Dues due",
      detail: `${formatCents(season.duesCents)} per household`,
    },
    {
      date: season.openingDay,
      label: "Opening day",
      detail: `The pool opens at ${formatTime(season.openingTime)}`,
    },
  ];

  // When the hours change partway through, the last change is the big one (usually
  // "open every day"). Skip it if it would land on opening day itself.
  const last = hours[hours.length - 1];
  if (last && hours.length > 1 && last.startsOn > season.openingDay) {
    list.push({
      date: last.startsOn,
      label: last.days.length === 7 ? "Open every day" : last.label,
      detail: "See the pool hours for the details",
    });
  }
  list.push({
    date: season.closingDay,
    label: "Last swim of summer",
    detail: "The pool closes for the season",
  });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
