import { Card, PageHeader, Section } from "../components/ui";
import { club, hoursNotes, hoursSchedules, season } from "../content/sample";
import { formatDay, formatTimeRange, weekdayOf } from "../lib/dates";
import type { Route } from "./+types/hours";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Show Monday first, the way people read a week.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function meta(_: Route.MetaArgs) {
  return [{ title: `Pool hours | ${club.shortName}` }];
}

/** Weekdays that occur between two dates. A week or more covers them all. */
function daysIn(start: string, end: string) {
  const found = new Set<number>();
  for (let d = start; d <= end && found.size < 7; d = nextDay(d)) found.add(weekdayOf(d));
  return found;
}

function nextDay(date: string) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export function loader() {
  return {
    openingDay: formatDay(season.openingDay),
    closingDay: formatDay(season.closingDay),
    schedules: hoursSchedules.map((s) => ({
      label: s.label,
      range: `${formatDay(s.startsOn)} to ${formatDay(s.endsOn)}`,
      rows: ORDER.filter((weekday) => daysIn(s.startsOn, s.endsOn).has(weekday)).map((weekday) => {
        const day = s.days.find((d) => d.weekday === weekday);
        return {
          day: WEEKDAYS[weekday]!,
          hours: day ? formatTimeRange(day.open, day.close) : "Closed",
        };
      }),
    })),
  };
}

export default function Hours({ loaderData }: Route.ComponentProps) {
  const { openingDay, closingDay, schedules } = loaderData;
  return (
    <>
      <PageHeader
        title="Pool hours"
        intro={`The ${season.name} season runs ${openingDay} through ${closingDay}.`}
        image="/images/beachball.webp"
      />
      {schedules.map((s) => (
        <Section key={s.label} title={s.label}>
          <Card>
            <p className="font-semibold text-pool-text">{s.range}</p>
            <table className="mt-3 w-full text-left">
              <caption className="sr-only">
                {s.label} hours, {s.range}
              </caption>
              <tbody>
                {s.rows.map((row) => (
                  <tr key={row.day} className="border-t border-deep/10">
                    <th scope="row" className="py-2 pr-4 font-semibold">
                      {row.day}
                    </th>
                    <td className="py-2">{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Section>
      ))}
      <Section title="Good to know">
        <ul className="list-disc space-y-2 pl-6">
          {Object.values(hoursNotes).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}
