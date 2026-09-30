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
  boardEmail: "huntingtonhillssrc@gmail.com",
  lifeguardEmail: "hhswimlifeguards@gmail.com",
  facebookGroup: "https://www.facebook.com/groups/542041177504668/",
  jobApplication: "https://forms.gle/KQckCts1ncmV4W3B6",
  about:
    "A private club in Strathmore Hills, Melville, shared by deed with the neighborhood's 252 homes. Volunteer neighbors on the elected board run it, so families can relax by the pool, play on the courts and playground, and join events all spring and summer.",
};

/** What's at the club, with a photo each. Photos are stand-ins until the board sends real ones. */
export const amenities = [
  {
    name: "The pool",
    blurb: "Lifeguards on duty, lap lanes from 12 to 2 PM, and plenty of room to splash.",
    image: "/images/beachball.webp",
    alt: "A beach ball floating in a bright blue pool",
    link: { label: "Pool hours", href: "/hours" },
  },
  {
    name: "Swim lessons",
    blurb: "Sunday toddler lessons with lifeguards Peter and Catherine, July and August.",
    image: "/images/lessons.webp",
    alt: "Children practicing with kickboards in a pool",
    link: { label: "Lessons", href: "/events#lessons" },
  },
  {
    name: "Tennis and pickleball",
    blurb: "Courts for members and invited guests. Beginners welcome.",
    image: "/images/pickleball.webp",
    alt: "Two pickleball paddles and balls on a court",
    link: { label: "Court rules", href: "/rules#courts" },
  },
  {
    name: "Playground and basketball",
    blurb: "A playground for little ones and courts for pickup games.",
    image: "/images/playground.webp",
    alt: "A red spiral slide on a playground under green trees",
    link: { label: "Play rules", href: "/rules" },
  },
];

export const season: Season & {
  duesCents: number;
  duesDueOn: string;
  lateFeeCents: number;
  statementsMailed: string;
  openingTime: string;
} = {
  name: "2027",
  // Memorial Day weekend. Weekend hours until school is out, then every day.
  openingDay: "2027-05-29",
  openingTime: "12:00",
  closingDay: "2027-09-06", // Labor Day
  duesCents: 82_500,
  duesDueOn: "2027-04-30",
  lateFeeCents: 10_000,
  statementsMailed: "March",
};

/** The yearly members meeting. The 2026 meeting was Friday, February 27 at the Half Hollow Hills library. */
export const membersMeeting = {
  title: "Members meeting",
  startsAt: "2027-02-26T19:00:00-05:00",
  // Until the board confirms, show the day only and say the time is coming.
  timeConfirmed: false,
  place: "Half Hollow Hills Community Library",
  town: "Dix Hills",
  description:
    "Hear the plans for the summer, meet the board and ask questions. Every household is welcome.",
};

const everyDay = (open: string, close: string) =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, open, close }));
const weekdays = (open: string, close: string) =>
  [1, 2, 3, 4, 5].map((weekday) => ({ weekday, open, close }));

export const hoursSchedules: HoursSchedule[] = [
  {
    label: "Spring weekends",
    startsOn: "2027-05-29",
    endsOn: "2027-06-20",
    days: [
      { weekday: 5, open: "15:00", close: "19:00" },
      { weekday: 6, open: "12:00", close: "19:00" },
      { weekday: 0, open: "12:00", close: "19:00" },
    ],
  },
  {
    label: "Last week of school",
    startsOn: "2027-06-21",
    endsOn: "2027-06-25",
    days: [
      ...weekdays("14:00", "18:00").slice(0, 4),
      { weekday: 5, open: "15:00", close: "19:00" },
    ],
  },
  {
    label: "Full season",
    startsOn: "2027-06-26",
    endsOn: "2027-09-06",
    days: everyDay("12:00", "19:00"),
  },
];

export const hoursNotes = {
  lapLanes: "Lap lanes are open 12 to 2 PM every day in the full season.",
  weekendLessons:
    "Weekends at 10:30 AM in the full season: toddler swim time. On lesson Sundays, lessons share the pool.",
  weather: "Hours can change for weather and events. We'll post any change here first.",
};

/** The big dates of the club year, in order. */
export const milestones = [
  {
    date: membersMeeting.startsAt.slice(0, 10),
    label: "Members meeting",
    detail: "Half Hollow Hills library, time to be confirmed",
  },
  {
    date: "2027-03-01",
    monthOnly: true,
    label: "Dues statements mailed",
    detail: "Watch your mailbox in March",
  },
  { date: season.duesDueOn, label: "Dues due", detail: "$825 per household" },
  { date: season.openingDay, label: "Opening weekend", detail: "Memorial Day weekend, from 12 PM" },
  { date: "2027-06-26", label: "Open every day", detail: "12 to 7 PM through Labor Day" },
  { date: season.closingDay, label: "Last swim of summer", detail: "Labor Day" },
];

export const board = [
  { name: "Shirley Vargas", role: "President" },
  { name: "Ken Gold", role: "Vice President" },
  { name: "Prem Katyal", role: "Treasurer" },
  { name: "Toby Abel", role: "Assistant Treasurer and Secretary" },
  { name: "Dan Shewchuk", role: "Trustee" },
  { name: "Mark Bolling", role: "Trustee" },
  { name: "Brandon Brown", role: "Trustee" },
];

export const toddlerLessons = {
  instructors: "Lifeguards Peter and Catherine",
  price: "$20 a lesson",
  when: "Sunday mornings in July and August, weather permitting",
  // 2026 ran Sundays July 12, 19 and August 9, 16, 23, 30. Same pattern for 2027.
  dates: ["2027-07-11", "2027-07-18", "2027-08-08", "2027-08-15", "2027-08-22", "2027-08-29"],
  organizer: { name: "Brandon Brown", email: "huntingtonhillssrc@gmail.com" },
  groups: [
    { time: "10 to 10:30 AM", ages: "Ages 1½ to 2½" },
    { time: "10:30 to 11 AM", ages: "Ages 2½ to 3½" },
    { time: "10:30 to 11 AM", ages: "Ages 3½ to 5" },
  ],
  olderKids: "For private lessons or kids older than 5, ask the lifeguard instructors directly.",
};

/** Files the board shares with members. Linked from the old site until they move to our own storage. */
export const documents = [
  {
    title: "Club rules and regulations",
    href: "https://www.hhprc.club/_files/ugd/cda429_b23eb40fd50545f9be7d4ed78238abb8.pdf",
    kind: "PDF",
  },
  {
    title: "Seasonal letter 2026",
    href: "https://www.hhprc.club/_files/ugd/cda429_2f2d842329d748c0b7db386361384805.docx",
    kind: "Word",
  },
  {
    title: "Members meeting Q&A",
    href: "https://www.hhprc.club/_files/ugd/cda429_f02478f11436461ab8601cc72b869a70.pdf",
    kind: "PDF",
  },
  {
    title: "Recent mailing",
    href: "https://www.hhprc.club/_files/ugd/cda429_2d3aec7e99ca4110b1d67c4d2f5bd46a.pdf",
    kind: "PDF",
  },
  {
    title: "Dues statement",
    href: "https://www.hhprc.club/_files/ugd/cda429_d4a898c667a64c81b51673ce19191600.pdf",
    kind: "PDF",
  },
  {
    title: "Party forms",
    href: "https://www.hhprc.club/_files/ugd/cda429_b855dd9d289e43a49755ba6ee0f25970.pdf",
    kind: "PDF",
  },
  {
    title: "Maria's snack bar menu",
    href: "https://www.hhprc.club/_files/ugd/cda429_584f5463ec184bc7b17f05de42672285.docx",
    kind: "Word",
  },
];

export type Announcement = {
  title: string;
  body: string;
  nextStep: { label: string; href: string };
};

export const announcements: Announcement[] = [
  {
    title: "Maria's snack bar",
    body: "Hungry after a swim? Maria's snack bar is back by the pool. Snacks are for the picnic tables.",
    nextStep: {
      label: "See the menu (Word file)",
      href: "/about#documents",
    },
  },
  {
    title: "New to the neighborhood?",
    body: "Every one of the 252 homes in Strathmore Hills comes with a club membership. Send the board your contact details so we can get you set up.",
    nextStep: { label: "Email the board", href: "mailto:info@hhprc.club" },
  },
  {
    title: "Lifeguards wanted",
    body: "Certified lifeguard, or a teen looking for a summer job close to home? We offer a flexible schedule.",
    nextStep: { label: "Apply for a summer job", href: club.jobApplication },
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
    title: "Opening weekend",
    startsAt: "2027-05-29T12:00:00-04:00",
    location: "Pool",
    description: "The first swim of the summer. Weekend hours run until school is out.",
    kind: "event",
  },
  {
    title: "Full season hours begin",
    startsAt: "2027-06-26T12:00:00-04:00",
    location: "Pool",
    description: "The pool is open every day from 12 to 7 PM through Labor Day.",
    kind: "event",
  },
  {
    title: "Toddler swim lessons begin",
    startsAt: "2027-07-11T10:00:00-04:00",
    location: "Pool",
    description:
      "With lifeguards Peter and Catherine, $20 a lesson. Then Sundays July 18 and August 8, 15, 22 and 29.",
    kind: "lesson",
  },
  {
    title: "Last swim of summer",
    startsAt: "2027-09-06T12:00:00-04:00",
    location: "Pool",
    description: "Labor Day. Come say goodbye to summer with the neighbors.",
    kind: "event",
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
      "Courts are for members and their invited guests.",
      "Basketball and handball are open pickup. Post in the Facebook group to set up a game.",
      "Pickleball: tennis shoes are required, and bring water only.",
    ],
  },
];
