import { CalendarIcon } from "../components/icons";
import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club, events, toddlerLessons } from "../content/sample";
import { formatDateTime, formatDay } from "../lib/dates";
import type { Route } from "./+types/events";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Events and lessons | ${club.shortName}` }];
}

export function loader() {
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((e) => ({ ...e, when: formatDateTime(new Date(e.startsAt)) }));
  return {
    events: upcoming.filter((e) => e.kind === "event"),
  };
}

type Item = ReturnType<typeof loader>["events"][number];

function EventList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <p>Nothing scheduled yet. Check back in spring.</p>
      </Card>
    );
  }
  return (
    <ul className="space-y-4">
      {items.map((e) => (
        <li key={e.title}>
          <Card className="border-l-4 border-coral">
            <p className="flex items-center gap-2 font-semibold text-pool-text">
              <CalendarIcon className="size-5" />
              {e.when} · {e.location}
            </p>
            <h3 className="mt-2 font-display text-xl font-extrabold">{e.title}</h3>
            <p className="mt-1">{e.description}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default function Events({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader
        title="Events and lessons"
        intro="Opening day, swim lessons and the big dates of the summer, all run by volunteer neighbors."
        image="/images/picnic.webp"
      />
      <Section title="Events">
        <EventList items={loaderData.events} />
      </Section>
      <Section title="Lessons" id="lessons">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <img
              src="/images/lessons.webp"
              alt="Children practicing with kickboards in a pool"
              loading="lazy"
              width={900}
              height={680}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-6">
              <h3 className="font-display text-xl font-extrabold">Toddler swim lessons</h3>
              <p className="mt-1 text-slate-700">
                {toddlerLessons.when}. {toddlerLessons.instructors} teach, {toddlerLessons.price}.
              </p>
              <p className="mt-3 font-semibold">Lesson days</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {toddlerLessons.dates.map((d) => (
                  <li key={d} className="rounded-full bg-pool/10 px-3 py-1 font-semibold">
                    {formatDay(d)}
                  </li>
                ))}
              </ul>
              <table className="mt-4 w-full text-left">
                <caption className="sr-only">Toddler lesson times by age</caption>
                <tbody>
                  {toddlerLessons.groups.map((g) => (
                    <tr key={g.ages} className="border-t border-deep/10">
                      <th scope="row" className="py-2 pr-4 font-semibold">
                        {g.ages}
                      </th>
                      <td className="py-2">{g.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-slate-700">{toddlerLessons.olderKids}</p>
              <p className="mt-4">
                <TextLink to={`mailto:${toddlerLessons.organizer.email}?subject=Swim%20lessons`}>
                  Sign up with {toddlerLessons.organizer.name}
                </TextLink>
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden p-0">
            <img
              src="/images/pickleball.webp"
              alt="Two pickleball paddles and balls on a court"
              loading="lazy"
              width={900}
              height={680}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-6">
              <h3 className="font-display text-xl font-extrabold">Learn pickleball</h3>
              <p className="mt-1 text-slate-700">
                Neighbors who play are happy to teach. Come solo or as a couple. Tennis shoes are a
                must, and bring water only. Want a basketball or handball pickup game? Post in the
                Facebook group.
              </p>
              <p className="mt-4">
                <TextLink to={`mailto:${club.email}?subject=Pickleball`}>
                  Get connected with a pickleball player
                </TextLink>
              </p>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
