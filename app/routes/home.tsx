import { StatusBadge } from "../components/StatusBadge";
import { CalendarIcon, ClockIcon } from "../components/icons";
import { Card, PrimaryButton, Section, TextLink } from "../components/ui";
import { announcements, club, events, hoursNotes, hoursSchedules, season } from "../content/sample";
import { formatDateTime, formatDay, formatTimeRange } from "../lib/dates";
import { poolStatus } from "../lib/pool-status";
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

// Status and dates are worked out on the server in club time, so every
// visitor sees the same answer and the page doesn't flicker on load.
export function loader() {
  const now = new Date();
  const fullSeason = hoursSchedules.at(-1)!;
  const typical = fullSeason.days[0]!;
  return {
    status: poolStatus(now, season, hoursSchedules),
    openingDay: formatDay(season.openingDay),
    closingDay: formatDay(season.closingDay),
    typicalHours: formatTimeRange(typical.open, typical.close),
    upcoming: events
      .filter((e) => new Date(e.startsAt) >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 3)
      .map((e) => ({ ...e, when: formatDateTime(new Date(e.startsAt)) })),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { status, openingDay, closingDay, typicalHours, upcoming } = loaderData;

  return (
    <>
      <section className="relative overflow-hidden bg-deep text-white">
        <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:pt-16">
          <p className="font-display text-lg font-bold text-sun">Welcome, neighbors</p>
          <h1 className="mt-2 max-w-xl font-display text-4xl leading-tight font-extrabold sm:text-5xl">
            Your summer starts at the club.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-sky-100">
            Pool, courts and playground for the {club.homes} homes of {club.neighborhood}.
          </p>
          <div className="mt-8">
            <PrimaryButton to="/hours">See pool hours</PrimaryButton>
          </div>
        </div>
        <Waves />
      </section>

      <div className="mx-auto -mt-16 max-w-5xl px-4">
        <Card className="relative">
          <StatusBadge status={status} />
          <p className="mt-3">
            The {season.name} season runs {openingDay} through {closingDay}. Full-season hours are{" "}
            {typicalHours} daily.
          </p>
          <p className="mt-1 text-slate-700">{hoursNotes[0]}</p>
        </Card>
      </div>

      <Section title="News from the board">
        <ul className="grid gap-4 sm:grid-cols-3">
          {announcements.map((a) => (
            <li key={a.title}>
              <Card className="flex h-full flex-col">
                <h3 className="font-display text-lg font-extrabold">{a.title}</h3>
                <p className="mt-2 flex-1">{a.body}</p>
                <p className="mt-4">
                  <TextLink to={a.nextStep.href}>{a.nextStep.label}</TextLink>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Coming up" action={{ label: "All events and lessons", to: "/events" }}>
        {upcoming.length === 0 ? (
          <Card>
            <p>
              Nothing on the calendar yet. The social committee posts summer events each spring.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.title}>
                <Card className="h-full border-t-4 border-coral">
                  <p className="flex items-center gap-2 font-semibold text-pool-text">
                    <CalendarIcon className="size-5" />
                    {e.when}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-extrabold">{e.title}</h3>
                  <p className="mt-1 text-slate-700">{e.location}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="At the club">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {club.amenities.map((name) => (
            <li key={name}>
              <Card className="h-full text-center font-display font-bold">{name}</Card>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-slate-700">
          <ClockIcon className="size-5" />
          {hoursNotes[1]}
        </p>
      </Section>
    </>
  );
}

function Waves() {
  return (
    <svg
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-16 w-full text-sand"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <path
        fill="#0EA5E9"
        opacity="0.35"
        d="M0 40c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v40H0Z"
      />
      <path
        fill="currentColor"
        d="M0 56c120-16 240-16 360 0s240 16 360 0 240-16 360 0 240 16 360 0v24H0Z"
      />
    </svg>
  );
}
