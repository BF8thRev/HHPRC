// TEMPLATE SAMPLE CONTENT — not the source of truth.
// Facts come from the current hhprc.club site (September 2026). 2027 dates
// follow the 2026 pattern and are placeholders until the board sets them.
// In later phases this moves to the database: seasons, hours_schedules,
// blocks and events. Nothing here should survive past the content phase.
import type { HoursSchedule, Season } from "../lib/pool-status";

export const club = {
  name: "Huntington Hills Swim & Racquet Club",
  shortName: "Huntington Hills",
  neighborhood: "Strathmore Hills",
  homes: 252,
  address: { street: "16 Westbourne Lane", city: "Melville", state: "NY", zip: "11747" },
  email: "info@hhprc.club",
  facebookGroup: "https://www.facebook.com/groups/542041177504668/",
  amenities: ["Pool", "Tennis and pickleball courts", "Basketball court", "Playground"],
};

export const season: Season & {
  duesCents: number;
  duesDueOn: string;
  lateFeeCents: number;
  statementsMailed: string;
} = {
  name: "2027",
  openingDay: "2027-06-21",
  closingDay: "2027-09-06",
  duesCents: 82_500,
  duesDueOn: "2027-04-30",
  lateFeeCents: 10_000,
  statementsMailed: "March",
};

const everyDay = (open: string, close: string) =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, open, close }));
const weekdays = (open: string, close: string) =>
  [1, 2, 3, 4, 5].map((weekday) => ({ weekday, open, close }));

export const hoursSchedules: HoursSchedule[] = [
  {
    label: "Opening week",
    startsOn: "2027-06-21",
    endsOn: "2027-06-25",
    days: weekdays("14:00", "19:00"),
  },
  {
    label: "Full season",
    startsOn: "2027-06-26",
    endsOn: "2027-09-06",
    days: everyDay("12:00", "19:00"),
  },
];

export const hoursNotes = [
  "Lap lanes are open 12 to 2 PM every day.",
  "Saturdays and Sundays at 10:30 AM: toddler swim and lessons.",
  "Hours can change for weather and events. We'll post any change here first.",
];

export type Announcement = {
  title: string;
  body: string;
  nextStep: { label: string; href: string };
};

export const announcements: Announcement[] = [
  {
    title: "2027 dues are due Friday, April 30",
    body: "Dues are $825 per household. Statements go out in March. Payments received after April 30 include a $100 late fee.",
    nextStep: { label: "See ways to pay", href: "/dues" },
  },
  {
    title: "New to the neighborhood?",
    body: "Every one of the 252 homes in Strathmore Hills comes with a club membership. Send the board your contact details so we can get you set up.",
    nextStep: { label: "Email the board", href: "mailto:info@hhprc.club" },
  },
  {
    title: "Summer jobs for teens",
    body: "We hire for the season and do our best to offer a flexible schedule.",
    nextStep: {
      label: "Ask about summer jobs",
      href: "mailto:info@hhprc.club?subject=Summer%20jobs",
    },
  },
];

export type ClubEvent = {
  title: string;
  startsAt: string; // ISO instant with offset
  location: string;
  description: string;
  kind: "event" | "lesson";
};

export const events: ClubEvent[] = [
  {
    title: "Full season hours begin",
    startsAt: "2027-06-26T12:00:00-04:00",
    location: "Pool",
    description: "The pool is open every day from 12 to 7 PM through Labor Day.",
    kind: "event",
  },
  {
    title: "Toddler swim lessons",
    startsAt: "2027-07-10T10:00:00-04:00",
    location: "Pool",
    description:
      "Certified instructors, $20 a lesson. Ages 1½ to 2½ at 10 AM; ages 2½ to 5 at 10:30 AM. Email to sign up.",
    kind: "lesson",
  },
  {
    title: "Maria's Poolside Greek Night",
    startsAt: "2027-07-17T18:00:00-04:00",
    location: "Pool deck",
    description: "Food, music and neighbors by the pool. Bring the whole family.",
    kind: "event",
  },
  {
    title: "Beginner pickleball lessons",
    startsAt: "2027-07-24T10:30:00-04:00",
    location: "Courts",
    description: "Come solo or as a couple. Bring water and court shoes.",
    kind: "lesson",
  },
];

export const rules: { id: string; title: string; items: string[] }[] = [
  {
    id: "family",
    title: "A family-friendly club",
    items: [
      "Please don't bring alcoholic beverages into the club.",
      "Food and flavored drinks are for the picnic tables only.",
    ],
  },
  {
    id: "pool",
    title: "At the pool",
    items: [
      "Lap lanes are reserved for laps from 12 to 2 PM every day.",
      "Follow the lifeguards' directions at all times.",
    ],
  },
  {
    id: "courts",
    title: "Courts",
    items: [
      "Basketball and handball are open pickup. Post in the Facebook group to set up a game.",
      "Wear court shoes on the tennis and pickleball courts.",
    ],
  },
];
