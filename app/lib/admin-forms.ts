// Turns the admin editor's plain HTML forms into validated content and back.
// Forms are plain posts (no client state), so they work on any phone, and every
// value still goes through the Zod schemas in app/content/blocks.ts on the server.
import type { Content, SectionKey } from "../content/blocks";
import { clubDate, clubInstant, clubMinutes } from "./dates";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "time" | "select" | "checkbox";
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
};

export const specs: Record<SectionKey, Spec> = {
  announcements: {
    title: "News and announcements",
    intro:
      "These show on the home page. Each one needs a next step, like a link to sign up or an email address. To remove one, clear its title.",
    shape: "list",
    rowLabel: "Announcement",
    spareRows: 2,
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
  meeting: {
    title: "Yearly members meeting",
    intro: "Shown on the home page with an add-to-calendar link.",
    shape: "single",
    rowLabel: "Meeting",
    spareRows: 0,
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
    const title = get(i, "title");
    if (!title) continue; // a cleared title removes the row

    if (key === "announcements") {
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
    return values[0] ? { ok: true, value: values[0] } : { ok: false, error: "Add a title." };
  }
  return { ok: true, value: values };
}
