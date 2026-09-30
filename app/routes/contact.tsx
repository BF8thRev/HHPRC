import { FeedbackForm } from "../components/FeedbackForm";
import { Card, PageHeader, Section } from "../components/ui";
import { club } from "../content/sample";
import { submitFeedback } from "../lib/feedback";
import type { Route } from "./+types/contact";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Ideas, questions and issues | ${club.shortName}` }];
}

export async function action({ request, context }: Route.ActionArgs) {
  return submitFeedback(context.cloudflare.env.DB, await request.formData());
}

export default function Contact({ actionData }: Route.ComponentProps) {
  return (
    <>
      <PageHeader
        title="Ideas, questions and issues"
        intro="Have an idea for the club, a question, or something that needs fixing? Tell us here."
      />
      <Section title="Send a note to the board">
        <Card className="max-w-2xl">
          <FeedbackForm fallback={actionData} />
        </Card>
        <p className="mt-6 max-w-2xl">
          In a hurry, or something urgent at the pool? Email{" "}
          <a className="font-semibold underline underline-offset-4" href={`mailto:${club.email}`}>
            {club.email}
          </a>
          .
        </p>
      </Section>
    </>
  );
}
