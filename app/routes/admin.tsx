import { Link } from "react-router";

import { ArrowIcon, FileIcon } from "../components/icons";
import { Card, PageHeader, Section } from "../components/ui";
import { club } from "../content/sample";
import { sectionKeys } from "../content/blocks";
import { requireBoard } from "../lib/access";
import { getContentMeta } from "../lib/content";
import { formatDay, clubDate } from "../lib/dates";
import { specs } from "../lib/admin-forms";
import { listFeedback } from "../lib/feedback";
import type { Route } from "./+types/admin";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Edit the site | ${club.shortName}` }, { name: "robots", content: "noindex" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const email = await requireBoard(request, env);
  const isOwner = !!env.FEEDBACK_OWNER_EMAIL && email === env.FEEDBACK_OWNER_EMAIL.toLowerCase();

  const sections = await Promise.all(
    sectionKeys.map(async (key) => {
      const meta = await getContentMeta(env.DB, key);
      return {
        key,
        title: specs[key].title,
        intro: specs[key].intro,
        edited: meta ? `${formatDay(clubDate(meta.updatedAt))} by ${meta.updatedBy}` : null,
      };
    }),
  );
  const open = isOwner ? (await listFeedback(env.DB)).filter((f) => !f.handledAt).length : null;
  return { email, sections, isOwner, open };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const { email, sections, isOwner, open } = loaderData;
  return (
    <>
      <PageHeader
        title="Edit the site"
        intro={`Signed in as ${email}. Pick what you want to change. Changes go live as soon as you save.`}
      />

      <Section title="Pages and news">
        <ul className="grid gap-5 md:grid-cols-2">
          {sections.map((s) => (
            <li key={s.key}>
              <Card className="flex h-full flex-col">
                <h3 className="font-display text-xl font-extrabold">{s.title}</h3>
                <p className="mt-2 flex-1">{s.intro}</p>
                <p className="mt-3 text-slate-700">
                  {s.edited
                    ? `Last changed ${s.edited}.`
                    : "Not changed yet. Showing the starter text."}
                </p>
                <Link
                  to={`/admin/edit/${s.key}`}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-sun px-6 font-bold text-deep shadow-sm hover:bg-yellow-300"
                >
                  Edit<span className="sr-only"> {s.title}</span>
                  <ArrowIcon />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Files and messages">
        <ul className="grid gap-5 md:grid-cols-2">
          <li>
            <Card className="flex h-full items-start gap-4">
              <FileIcon className="size-7 shrink-0 text-coral-text" />
              <div>
                <h3 className="font-display text-xl font-extrabold">Documents</h3>
                <p className="mt-2">Upload or remove the PDFs and forms on the About page.</p>
                <Link
                  to="/board"
                  className="mt-3 inline-block font-semibold underline underline-offset-4"
                >
                  Open documents
                </Link>
              </div>
            </Card>
          </li>
          {isOwner && (
            <li>
              <Card className="flex h-full flex-col">
                <h3 className="font-display text-xl font-extrabold">Ideas, questions and issues</h3>
                <p className="mt-2 flex-1">
                  {open
                    ? `${open} waiting for you.`
                    : "Nothing waiting. Notes from neighbors show up here."}
                </p>
                <Link
                  to="/admin/inbox"
                  className="mt-3 inline-block font-semibold underline underline-offset-4"
                >
                  Open the inbox
                </Link>
              </Card>
            </li>
          )}
        </ul>
      </Section>
    </>
  );
}
