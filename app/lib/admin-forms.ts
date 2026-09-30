// Turns the admin editor's plain HTML forms into validated content and back.
// Forms are plain posts (no client state), so they work on any phone, and every
// value still goes through the Zod schemas in app/content/blocks.ts on the server.
import type { Content, SectionKey } from "../content/blocks";
import { clubDate, clubInstant, clubMinutes } from "./dates";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "time" | "select" | "checkbox" | "money";
  options?: { value: string; label: string }[];
  hint?: string;
  placeholder?: string;
};

export type Spec = {
  title: string;
  intro: string;
  /** "list" sections are repeated rows; "single" sections are one row. */
  shape: "list" | "single";
  rowLabel: string;
  fields: Field[];
  /** Empty rows offered for adding something new. */
  spareRows: number;
  /** The field that must be filled for a row to count. A cleared one removes the row. */
  keyField: string;
  /** Whether "Undo all my changes" makes sense for this section. */
  resettable: boolean;
};

const WEEK = [
  { n: 1, name: "Monday" },
  { n: 2, name: "Tuesday" },
  { n: 3, name: "Wednesday" },
  { n: 4, name: "Thursday" },
  { n: 5, name: "Friday" },
  { n: 6, name: "Saturday" },
  { n: 0, name: "Sunday" },
];
const dayFields = WEEK.flatMap(({ n, name }): Field[] => [
  { name: `d${n}o`, label: `${name} opens`, type: "time" },
  { name: `d${n}c`, label: `${name} closes`, type: "time" },
]);

export const specs: Record<SectionKey, Spec> = {
  announcements: {
    title: "News and announcements",
    intro:
      "These show on the home page. Each one needs a next step, like a link to sign up or an email address. To remove one, clear its title.",
    shape: "list",
    rowLabel: "Announcement",
    spareRows: 2,
    keyField: "title",
    resettable: true,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Message", type: "textarea" },
      { name: "label", label: "Button words", type: "text", placeholder: "Sign up" },
      {
        name: "href",
        label: "Button link",
        type: "text",
        hint: "A page like /events, a web address starting with https://, or mailto:you@example.com",
      },
    ],
  },
  events: {
    title: "Events and lessons",
    intro:
      "Everything on the Events page and the home page calendar. Times are club time (New York). To remove one, clear its title.",
    shape: "list",
    rowLabel: "Event",
    spareRows: 3,
    keyField: "title",
    resettable: true,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "time", label: "Start time", type: "time" },
      { name: "location", label: "Where", type: "text", placeholder: "Pool" },
      { name: "description", label: "Details", type: "textarea" },
      {
        name: "kind",
        label: "Type",
        type: "select",
        options: [
          { value: "event", label: "Event" },
          { value: "lesson", label: "Swim lesson" },
        ],
      },
    ],
  },
  hours: {
    title: "Pool hours",
    intro:
      "The weekly hours on the Hours page and the open-or-closed badge on the home page. Each set covers a run of dates. Leave a day's times empty if the pool is closed that day. To remove a set, clear its name.",
    shape: "list",
    rowLabel: "Hours",
    spareRows: 1,
    keyField: "label",
    resettable: true,
    fields: [
      { name: "label", label: "Name", type: "text", placeholder: "Full season" },
      { name: "startsOn", label: "First day", type: "date" },
      { name: "endsOn", label: "Last day", type: "date" },
      ...dayFields,
    ],
  },
  hoursNotes: {
    title: "Good to know (hours notes)",
    intro: "Short notes under the hours, like lap lanes and weather. Keep each one to a sentence.",
    shape: "single",
    rowLabel: "Notes",
    spareRows: 0,
    keyField: "lapLanes",
    resettable: true,
    fields: [
      { name: "lapLanes", label: "Lap lanes", type: "textarea" },
      { name: "weekendLessons", label: "Weekend swim time and lessons", type: "textarea" },
      { name: "weather", label: "Weather and changes", type: "textarea" },
    ],
  },
  season: {
    title: "Season dates and dues",
    intro:
      "Opening and closing days, and what dues cost. To start a new year, change the season name and the dates: the old season is kept. Every price and date on the Dues page comes from here.",
    shape: "single",
    rowLabel: "Season",
    spareRows: 0,
    keyField: "name",
    resettable: false,
    fields: [
      { name: "name", label: "Season name", type: "text", placeholder: "2027" },
      { name: "openingDay", label: "Opening day", type: "date" },
      { name: "openingTime", label: "Opens at", type: "time" },
      { name: "closingDay", label: "Last day of the season", type: "date" },
      {
        name: "duesDollars",
        label: "Dues per household ($)",
        type: "money",
        hint: "Dollars, like 825 or 825.50",
      },
      { name: "duesDueOn", label: "Dues are due on", type: "date" },
      {
        name: "lateFeeDollars",
        label: "Late fee ($)",
        type: "money",
        hint: "Charged after the due date",
      },
      {
        name: "statementsMailed",
        label: "Statements are mailed in",
        type: "text",
        placeholder: "March",
      },
    ],
  },
  meeting: {
    title: "Yearly members meeting",
    intro: "Shown on the home page with an add-to-calendar link.",
    shape: "single",
    rowLabel: "Meeting",
    spareRows: 0,
    keyField: "title",
    resettable: true,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "time", label: "Start time", type: "time" },
      {
        name: "timeConfirmed",
        label: "The time is confirmed",
        type: "checkbox",
        hint: "Leave unchecked and the site says the time is coming soon.",
      },
      { name: "place", label: "Place", type: "text" },
      { name: "town", label: "Town", type: "text" },
      { name: "description", label: "Details", type: "textarea" },
    ],
  },
  rules: {
    title: "Club rules",
    intro:
      "The highlights on the Rules page. Put one rule on each line. To remove a heading, clear it.",
    shape: "list",
    rowLabel: "Rules heading",
    spareRows: 1,
    keyField: "title",
    resettable: true,
    fields: [
      { name: "title", label: "Heading", type: "text" },
      { name: "items", label: "Rules, one per line", type: "textarea" },
    ],
  },
};

type Row = Record<string, string>;

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "section";

/** 82500 becomes "825", 82550 becomes "825.50". */
export const centsToText = (c: number) => (c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2));

/** "825" or "$825.50" to cents. Null if it isn't a dollar amount. */
export function textToCents(text: string): number | null {
  const m = /^\$?\s*(\d{1,6})(?:\.(\d{1,2}))?$/.exec(text.replace(/,/g, "").trim());
  return m ? Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0")) : null;
}

const hhmm = (d: Date) => {
  const m = clubMinutes(d);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Saved content → the values shown in the form's fields. */
export function toRows<K extends SectionKey>(key: K, content: Content[K]): Row[] {
  const rows: Row[] = [];
  if (key === "announcements") {
    for (const a of content as Content["announcements"])
      rows.push({ title: a.title, body: a.body, label: a.nextStep.label, href: a.nextStep.href });
  } else if (key === "events") {
    for (const e of content as Content["events"]) {
      const at = new Date(e.startsAt);
      rows.push({
        title: e.title,
        date: clubDate(at),
        time: hhmm(at),
        location: e.location,
        description: e.description,
        kind: e.kind,
      });
    }
  } else if (key === "hours") {
    for (const h of content as Content["hours"]) {
      const row: Row = { label: h.label, startsOn: h.startsOn, endsOn: h.endsOn };
      for (const d of h.days) {
        row[`d${d.weekday}o`] = d.open;
        row[`d${d.weekday}c`] = d.close;
      }
      rows.push(row);
    }
  } else if (key === "hoursNotes") {
    rows.push({ ...(content as Content["hoursNotes"]) });
  } else if (key === "season") {
    const z = content as Content["season"];
    rows.push({
      name: z.name,
      openingDay: z.openingDay,
      openingTime: z.openingTime,
      closingDay: z.closingDay,
      duesDollars: centsToText(z.duesCents),
      duesDueOn: z.duesDueOn,
      lateFeeDollars: centsToText(z.lateFeeCents),
      statementsMailed: z.statementsMailed,
    });
  } else if (key === "meeting") {
    const m = content as Content["meeting"];
    const at = new Date(m.startsAt);
    rows.push({
      title: m.title,
      date: clubDate(at),
      time: hhmm(at),
      timeConfirmed: m.timeConfirmed ? "on" : "",
      place: m.place,
      town: m.town,
      description: m.description,
    });
  } else {
    for (const r of content as Content["rules"])
      rows.push({ id: r.id, title: r.title, items: r.items.join("\n") });
  }
  return rows;
}

const MAX_ROWS = 80;

/** Submitted form → the value to validate and save, or a friendly error. */
export function fromForm(
  key: SectionKey,
  form: FormData,
): { ok: true; value: unknown } | { ok: false; error: string } {
  const get = (i: number, name: string) => String(form.get(`${i}.${name}`) ?? "").trim();
  const values: unknown[] = [];

  for (let i = 0; i < (specs[key].shape === "single" ? 1 : MAX_ROWS); i++) {
    const title = get(i, specs[key].keyField);
    if (!title) continue; // a cleared title removes the row

    if (key === "hours") {
      const days: { weekday: number; open: string; close: string }[] = [];
      for (const { n, name } of WEEK) {
        const open = get(i, `d${n}o`);
        const close = get(i, `d${n}c`);
        if (!open && !close) continue; // closed that day
        if (!open || !close)
          return {
            ok: false,
            error: `${title}: ${name} needs both an opening and a closing time.`,
          };
        days.push({ weekday: n, open, close });
      }
      values.push({ label: title, startsOn: get(i, "startsOn"), endsOn: get(i, "endsOn"), days });
    } else if (key === "hoursNotes") {
      values.push({
        lapLanes: title,
        weekendLessons: get(i, "weekendLessons"),
        weather: get(i, "weather"),
      });
    } else if (key === "season") {
      const dues = textToCents(get(i, "duesDollars"));
      const fee = textToCents(get(i, "lateFeeDollars"));
      if (dues === null) return { ok: false, error: "Dues should be dollars, like 825 or 825.50." };
      if (fee === null) return { ok: false, error: "The late fee should be dollars, like 100." };
      values.push({
        name: title,
        openingDay: get(i, "openingDay"),
        openingTime: get(i, "openingTime"),
        closingDay: get(i, "closingDay"),
        duesCents: dues,
        duesDueOn: get(i, "duesDueOn"),
        lateFeeCents: fee,
        statementsMailed: get(i, "statementsMailed"),
      });
    } else if (key === "announcements") {
      values.push({
        title,
        body: get(i, "body"),
        nextStep: { label: get(i, "label"), href: get(i, "href") },
      });
    } else if (key === "rules") {
      values.push({
        id: get(i, "id") || slug(title),
        title,
        items: get(i, "items")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean),
      });
    } else {
      const date = get(i, "date");
      const time = get(i, "time") || "12:00";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
        return { ok: false, error: `"${title}" needs a date and a start time.` };
      const startsAt = clubInstant(date, time).toISOString();
      values.push(
        key === "events"
          ? {
              title,
              startsAt,
              location: get(i, "location"),
              description: get(i, "description"),
              kind: get(i, "kind") === "lesson" ? "lesson" : "event",
            }
          : {
              title,
              startsAt,
              timeConfirmed: form.get(`${i}.timeConfirmed`) === "on",
              place: get(i, "place"),
              town: get(i, "town"),
              description: get(i, "description"),
            },
      );
    }
  }

  if (specs[key].shape === "single") {
    return values[0]
      ? { ok: true, value: values[0] }
      : { ok: false, error: "Fill in the first box." };
  }
  return { ok: true, value: values };
}
