import { CalendarIcon } from "../components/icons";
import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club, events } from "../content/sample";
import { formatDateTime } from "../lib/dates";
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
    lessons: upcoming.filter((e) => e.kind === "lesson"),
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
        intro="Cookouts, parties and lessons, all planned by volunteer neighbors."
      />
      <Section title="Events">
        <EventList items={loaderData.events} />
      </Section>
      <Section title="Lessons">
        <EventList items={loaderData.lessons} />
        <p className="mt-4">
          <TextLink to={`mailto:${club.email}?subject=Lessons`}>Email us to sign up</TextLink>
        </p>
      </Section>
    </>
  );
}
