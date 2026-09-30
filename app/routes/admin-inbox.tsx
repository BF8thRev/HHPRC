import { Form, Link } from "react-router";

import { Card, PageHeader, Section } from "../components/ui";
import { club } from "../content/sample";
import { requireFeedbackOwner } from "../lib/access";
import { clubDate, formatDay } from "../lib/dates";
import { deleteFeedback, KINDS, listFeedback, setHandled } from "../lib/feedback";
import type { Route } from "./+types/admin-inbox";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Inbox | ${club.shortName}` }, { name: "robots", content: "noindex" }];
}

// Private to FEEDBACK_OWNER_EMAIL. Other board members get a 403 from the server.
export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireFeedbackOwner(request, env);
  const rows = await listFeedback(env.DB);
  return {
    items: rows.map((f) => ({
      id: f.id,
      kind: KINDS[f.kind as keyof typeof KINDS] ?? f.kind,
      message: f.message,
      name: f.name,
      email: f.email,
      sent: formatDay(clubDate(f.createdAt)),
      handled: !!f.handledAt,
    })),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  await requireFeedbackOwner(request, env);
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const intent = form.get("intent");
  if (intent === "delete") await deleteFeedback(env.DB, id);
  else if (intent === "done" || intent === "reopen")
    await setHandled(env.DB, id, intent === "done");
  return null;
}

export default function Inbox({ loaderData }: Route.ComponentProps) {
  const { items } = loaderData;
  return (
    <>
      <PageHeader
        title="Ideas, questions and issues"
        intro="Notes neighbors sent through the site. Only you can see this page."
      />
      <Section title={`${items.filter((i) => !i.handled).length} waiting`}>
        <p className="mb-5">
          <Link to="/admin" className="font-semibold underline underline-offset-4">
            Back to editing
          </Link>
        </p>
        {items.length === 0 ? (
          <Card>
            <p>Nothing yet. When a neighbor sends a note, it shows up here.</p>
          </Card>
        ) : (
          <ul className="space-y-4">
            {items.map((f) => (
              <li key={f.id}>
                <Card className={f.handled ? "opacity-75" : "border-l-4 border-coral"}>
                  <p className="font-display font-bold text-coral-text">
                    {f.kind} · {f.sent}
                    {f.handled && " · Done"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{f.message}</p>
                  <p className="mt-3 text-slate-700">
                    From {f.name ?? "a neighbor"}
                    {f.email ? (
                      <>
                        {" "}
                        (
                        <a className="underline" href={`mailto:${f.email}`}>
                          {f.email}
                        </a>
                        )
                      </>
                    ) : (
                      ", no email left"
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Form reloadDocument method="post">
                      <input type="hidden" name="id" value={f.id} />
                      <button
                        name="intent"
                        value={f.handled ? "reopen" : "done"}
                        className="min-h-11 rounded-full bg-sun px-5 font-bold text-deep hover:bg-yellow-300"
                      >
                        {f.handled ? "Mark as not done" : "Mark as done"}
                      </button>
                    </Form>
                    <Form
                      reloadDocument
                      method="post"
                      onSubmit={(e) => {
                        if (!confirm("Delete this note for good?")) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={f.id} />
                      <button
                        name="intent"
                        value="delete"
                        className="min-h-11 rounded-full px-4 font-semibold text-alert underline underline-offset-4 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
