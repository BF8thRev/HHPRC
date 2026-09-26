import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club, rules } from "../content/sample";
import type { Route } from "./+types/rules";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Club rules | ${club.shortName}` }];
}

export default function Rules() {
  return (
    <>
      <PageHeader
        title="Club rules"
        intro="A few simple rules keep the club safe and fun for every family."
      />
      {rules.map((section) => (
        <Section key={section.id} title={section.title}>
          <Card>
            <ul id={section.id} className="list-disc space-y-2 pl-6">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </Section>
      ))}
      <Section title="Questions about a rule?">
        <TextLink to={`mailto:${club.email}?subject=Club%20rules`}>Email the board</TextLink>
      </Section>
    </>
  );
}
