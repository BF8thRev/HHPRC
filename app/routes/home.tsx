import { Link } from "react-router";

import { Countdown } from "../components/Countdown";
import { SignupForm } from "../components/SignupForm";
import { StatusBadge } from "../components/StatusBadge";
import { ArrowIcon, CalendarIcon, ClockIcon, MapPinIcon } from "../components/icons";
import { Card, DateTile, Section, TextLink, Waves } from "../components/ui";
import { amenities, club } from "../content/sample";
import {
  clubDate,
  clubInstant,
  formatClubTime,
  formatDateTime,
  formatDay,
  formatShortDay,
} from "../lib/dates";
import { getContent } from "../lib/content";
import { buildMilestones } from "../lib/milestones";
import { poolStatus } from "../lib/pool-status";
import { signUp } from "../lib/signup";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: club.name },
    {
      name: "description",
      content: `Pool hours, events and news for the ${club.homes} homes of ${club.neighborhood}.`,
    },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  return signUp(context.cloudflare.env, await request.formData());
}

// Status and dates are worked out on the server in club time, so every
// visitor sees the same answer and the page doesn't flicker on load.
export async function loader({ context }: Route.LoaderArgs) {
  const { DB } = context.cloudflare.env;
  const [announcements, events, membersMeeting, season, hoursSchedules, hoursNotes] =
    await Promise.all([
      getContent(DB, "announcements"),
      getContent(DB, "events"),
      getContent(DB, "meeting"),
      getContent(DB, "season"),
      getContent(DB, "hours"),
      getContent(DB, "hoursNotes"),
    ]);
  const now = new Date();
  const today = clubDate(now);
  const opening = clubInstant(season.openingDay, season.openingTime);
  const meetingAt = new Date(membersMeeting.startsAt);
  const meetingDay = clubDate(meetingAt); // the club's calendar day, not the UTC day

  return {
    serverNow: now.getTime(),
    openingAt: opening.getTime(),
    beforeOpening: now < opening,
    status: poolStatus(now, season, hoursSchedules),
    openingDay: formatDay(season.openingDay),
    closingDay: formatDay(season.closingDay),
    meeting: {
      ...membersMeeting,
      when: membersMeeting.timeConfirmed
        ? formatDateTime(meetingAt)
        : `${formatDay(meetingDay)}, time to be confirmed`,
      tile: formatShortDay(meetingDay),
      upcoming: meetingAt >= now,
    },
    // Next three dates up front; the rest of the year folds away.
    announcements,
    seasonName: season.name,
    weekendNote: hoursNotes.weekendLessons,
    milestones: buildMilestones(season, hoursSchedules, membersMeeting)
      .filter((m) => m.date >= today)
      .map((m) => ({ ...m, tile: formatShortDay(m.date) })),
    upcoming: events
      .filter((e) => new Date(e.startsAt) >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 3)
      .map((e) => ({
        ...e,
        day: formatDay(clubDate(new Date(e.startsAt))),
        time: formatClubTime(new Date(e.startsAt)),
        tile: formatShortDay(clubDate(new Date(e.startsAt))),
      })),
  };
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const { meeting, upcoming } = loaderData;

  return (
    <>
      <Hero {...loaderData} />

      {/* Next up: the members meeting and the email list, side by side. */}
      <section aria-labelledby="next-up" className="mx-auto max-w-6xl px-4 pt-14">
        <h2 id="next-up" className="font-display text-3xl font-extrabold">
          Next up
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="flex flex-col">
            <div className="flex items-start gap-4">
              <DateTile {...meeting.tile} />
              <div>
                <p className="font-display font-bold text-coral-text">
                  {meeting.upcoming ? "Save the date" : "Recently"}
                </p>
                <h3 className="font-display text-2xl font-extrabold">{meeting.title}</h3>
              </div>
            </div>
            <p className="mt-4">{meeting.description}</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <ClockIcon className="size-5 shrink-0 text-pool-text" />
                {meeting.when}
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="size-5 shrink-0 text-pool-text" />
                {meeting.place}, {meeting.town}
              </li>
            </ul>
            <p className="mt-auto flex flex-wrap gap-x-6 pt-5">
              <TextLink to="/meeting.ics">Add to my calendar</TextLink>
              <TextLink to={`mailto:${club.email}?subject=Members%20meeting`}>
                Send the board a question
              </TextLink>
            </p>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-cyan-50">
            <div id="signup" className="scroll-mt-24">
              <p className="font-display font-bold text-coral-text">Stay in the loop</p>
              <h3 className="font-display text-2xl font-extrabold">Get club news by email</h3>
              <p className="mt-2 mb-5">
                Meeting reminders, opening day, pool closings and party invites, straight to your
                inbox.
              </p>
              <SignupForm fallback={actionData} />
            </div>
          </Card>
        </div>
      </section>

      <Section title="Your club year" eyebrow="Mark your calendar">
        <MilestoneList items={loaderData.milestones.slice(0, 3)} />
        {loaderData.milestones.length > 3 && (
          <details className="group mt-3">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-pool-text underline decoration-2 underline-offset-4 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">See the whole year</span>
              <span className="hidden group-open:inline">Show less</span>
            </summary>
            <div className="mt-3">
              <MilestoneList items={loaderData.milestones.slice(3)} />
            </div>
          </details>
        )}
      </Section>

      <Section title="Something for everyone" eyebrow="At the club">
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {amenities.map((a) => (
            <li
              key={a.name}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-deep/5"
            >
              <div className="aspect-square overflow-hidden sm:aspect-[4/3]">
                <img
                  src={a.image}
                  alt={a.alt}
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={680}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-5">
                <h3 className="font-display text-lg leading-snug font-extrabold sm:text-xl">
                  {a.name}
                </h3>
                <p className="mt-1 hidden flex-1 text-slate-700 sm:block">{a.blurb}</p>
                <p className="mt-auto pt-2 sm:pt-3">
                  <TextLink to={a.link.href}>{a.link.label}</TextLink>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-center gap-2 text-slate-700">
          <ClockIcon className="size-5 shrink-0" />
          {loaderData.weekendNote}
        </p>
      </Section>

      <Section
        title="Coming up this summer"
        eyebrow="Events and lessons"
        action={{ label: "See everything", to: "/events" }}
      >
        {upcoming.length === 0 ? (
          <Card>
            <p>
              Nothing on the calendar yet. The social committee posts summer events each spring.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-5 md:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.title + e.startsAt}>
                <Card className="flex h-full gap-4">
                  <DateTile {...e.tile} />
                  <div>
                    <h3 className="font-display text-lg leading-snug font-extrabold">{e.title}</h3>
                    <p className="mt-1 text-slate-700">{e.day}</p>
                    <p className="text-slate-700">{e.time}</p>
                    <p className="text-slate-700">{e.location}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="News from the board">
        <ul className="grid gap-5 md:grid-cols-3">
          {loaderData.announcements.map((a) => (
            <li key={a.title}>
              <Card className="flex h-full flex-col border-t-4 border-pool">
                <h3 className="font-display text-xl font-extrabold">{a.title}</h3>
                <p className="mt-2 flex-1">{a.body}</p>
                <p className="mt-4">
                  <TextLink to={a.nextStep.href}>{a.nextStep.label}</TextLink>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Got an idea, a question, or something broken?">
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl">
            Tell the board what you'd like to see at the club, ask a question, or report something
            that needs fixing. It only takes a minute.
          </p>
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sun px-8 font-bold text-deep shadow-sm hover:bg-yellow-300"
          >
            Send a note
            <ArrowIcon />
          </Link>
        </Card>
      </Section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="relative overflow-hidden rounded-3xl bg-deep text-white">
          <img
            src="/images/picnic.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="relative grid gap-4 p-8 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-3xl font-extrabold">A family-friendly club</h2>
              <p className="mt-2 max-w-xl text-sky-50">
                Please leave alcohol at home, and enjoy snacks and flavored drinks at the picnic
                tables. Thanks for keeping the club safe and fun for every family.
              </p>
            </div>
            <Link
              to="/rules"
              className="inline-flex min-h-11 items-center gap-2 font-bold text-white underline decoration-sun decoration-2 underline-offset-4"
            >
              Read the club rules
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

type Milestone = Route.ComponentProps["loaderData"]["milestones"][number];

function MilestoneList({ items }: { items: Milestone[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <li
          key={m.label}
          className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-deep/5"
        >
          <DateTile {...m.tile} monthOnly={"monthOnly" in m && m.monthOnly} />
          <div>
            <p className="font-display text-lg leading-snug font-extrabold">{m.label}</p>
            <p className="text-slate-700">{m.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Hero({
  serverNow,
  openingAt,
  beforeOpening,
  status,
  openingDay,
  closingDay,
  seasonName,
}: Route.ComponentProps["loaderData"]) {
  return (
    <section className="relative overflow-hidden bg-lagoon text-white">
      <picture>
        <source media="(min-width: 800px)" srcSet="/images/hero-1600.webp" />
        <img
          src="/images/hero-800.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-[center_30%]"
        />
      </picture>
      {/* Darker on the text side so white type stays readable over bright water. */}
      <div className="absolute inset-0 bg-gradient-to-b from-lagoon/85 via-lagoon/45 to-lagoon/70 lg:bg-gradient-to-r lg:from-lagoon/95 lg:via-lagoon/60 lg:to-lagoon/10" />

      {/* Phone order: headline, countdown, then the rest. Desktop: text left, countdown right. */}
      <div className="relative mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-24 sm:pt-16 sm:pb-32 lg:grid-cols-[1fr_1.05fr] lg:gap-x-10 lg:gap-y-6">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 font-semibold ring-1 ring-white/25 backdrop-blur-sm">
            <MapPinIcon className="size-5 text-sun" />
            {club.neighborhood} · Melville, NY
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] font-extrabold drop-shadow-sm sm:text-6xl">
            Where your family's summer memories are made.
          </h1>
        </div>

        <div className="max-w-2xl rounded-3xl bg-deep/55 p-4 ring-1 ring-white/25 backdrop-blur-md sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          {beforeOpening ? (
            <>
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-display text-xl font-extrabold sm:text-2xl">
                  Countdown to opening weekend
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-sun">
                  <CalendarIcon className="size-5" />
                  {openingDay}
                </span>
              </p>
              <div className="mt-4">
                <Countdown
                  target={openingAt}
                  serverNow={serverNow}
                  label={`opening weekend, ${openingDay}`}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white p-4 text-deep">
              <StatusBadge status={status} />
            </div>
          )}
          <p className="mt-4 text-sky-50">
            The {seasonName} season runs {openingDay} through {closingDay}.
          </p>
          <p className="mt-1">
            <Link
              to="/hours"
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-white underline decoration-sun decoration-2 underline-offset-4"
            >
              See pool hours
              <ArrowIcon className="size-4" />
            </Link>
          </p>
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <p className="max-w-xl text-lg text-sky-50 sm:text-xl">
            First swim lessons, lazy pool afternoons and pickup games, just down the street for the{" "}
            {club.homes} homes of {club.neighborhood}.
          </p>
          <p className="mt-6 hidden sm:block">
            <a
              href="#signup"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/80 px-5 font-semibold hover:bg-white hover:text-deep"
            >
              Get reminders by email
            </a>
          </p>
        </div>
      </div>
      <Waves />
    </section>
  );
}
