import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club, documents } from "../content/sample";
import { getContent } from "../lib/content";
import type { Route } from "./+types/rules";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Club rules | ${club.shortName}` }];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { rules: await getContent(context.cloudflare.env.DB, "rules") };
}

export default function Rules({ loaderData }: Route.ComponentProps) {
  const { rules } = loaderData;
  return (
    <>
      <PageHeader
        title="Club rules"
        intro="A few simple rules keep the club safe and fun for every family."
        image="/images/playground.webp"
      />
      {rules.map((section) => (
        <Section key={section.id} id={section.id} title={section.title}>
          <Card>
            <ul className="list-disc space-y-2 pl-6">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </Section>
      ))}
      <Section title="The full rules">
        <p>
          These are the highlights. The board's official rules and regulations have every detail.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-6">
          <TextLink to={documents[0]!.href}>Read the official rules (PDF)</TextLink>
          <TextLink to={`mailto:${club.email}?subject=Club%20rules`}>
            Ask the board about a rule
          </TextLink>
        </p>
      </Section>
    </>
  );
}
