import { Card, PageHeader, Section, TextLink } from "../components/ui";
import { club } from "../content/sample";
import type { Route } from "./+types/login";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Member login | ${club.shortName}` }];
}

// Placeholder until the auth phase adds magic-link sign-in.
export default function Login() {
  return (
    <>
      <PageHeader title="Member login" />
      <Section title="Household logins are coming soon">
        <Card>
          <p>
            You'll sign in with a link sent to your email. There's no password to remember. Once
            you're in, you can pay dues, update your household and see the Neighbors Board.
          </p>
          <p className="mt-4">
            <TextLink to={`mailto:${club.email}?subject=My%20household%20email`}>
              Make sure the board has your current email
            </TextLink>
          </p>
        </Card>
      </Section>
    </>
  );
}
