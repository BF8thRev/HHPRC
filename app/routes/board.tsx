import { Form } from "react-router";

import { CheckIcon, FileIcon } from "../components/icons";
import { Card, PageHeader, Section } from "../components/ui";
import { club } from "../content/sample";
import { requireBoard } from "../lib/access";
import { formatDay } from "../lib/dates";
import {
  ALLOWED_TYPES,
  deleteDocument,
  documentHref,
  formatSize,
  listDocuments,
  uploadDocument,
} from "../lib/documents";
import type { Route } from "./+types/board";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Board portal | ${club.shortName}` }, { name: "robots", content: "noindex" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const email = await requireBoard(request, env);
  const rows = await listDocuments(env.DB);
  return {
    email,
    documents: rows.map((d) => ({
      id: d.id,
      title: d.title,
      href: documentHref(d),
      kind: ALLOWED_TYPES[d.contentType] ?? "File",
      size: formatSize(d.size),
      uploadedBy: d.uploadedBy,
      uploadedOn: formatDay(d.uploadedAt.toISOString().slice(0, 10)),
    })),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  const email = await requireBoard(request, env);
  const form = await request.formData();

  if (form.get("intent") === "delete") {
    const removed = await deleteDocument(env, String(form.get("id") ?? ""));
    return removed
      ? { ok: true as const, message: "Document removed from the site." }
      : { ok: false as const, message: "That document was already gone." };
  }

  const result = await uploadDocument(env, form, email);
  return result.ok
    ? { ok: true as const, message: `“${result.title}” is now on the site.` }
    : { ok: false as const, message: result.error };
}

export default function Board({ loaderData, actionData }: Route.ComponentProps) {
  const { email, documents } = loaderData;

  return (
    <>
      <PageHeader
        title="Board portal"
        intro={`Signed in as ${email}. Documents you add here appear on the About page for every visitor.`}
      />

      <Section title="Add a document">
        <Card>
          {actionData && (
            <p
              role={actionData.ok ? "status" : "alert"}
              className={`mb-5 flex items-start gap-2 rounded-2xl p-4 font-semibold ${
                actionData.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-alert"
              }`}
            >
              {actionData.ok && <CheckIcon className="mt-0.5 size-5 shrink-0" />}
              {actionData.message}
            </p>
          )}
          {/* A new key after each upload clears the form for the next one. */}
          {/* Full page posts (reloadDocument) so every request passes through Cloudflare Access. */}
          <Form
            reloadDocument
            method="post"
            encType="multipart/form-data"
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <label htmlFor="doc-title" className="block font-semibold">
                Title
              </label>
              <input
                id="doc-title"
                name="title"
                required
                maxLength={100}
                placeholder="Club rules 2027"
                className="mt-1 w-full rounded-2xl border-2 border-deep/20 bg-white px-4 focus:border-pool focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="doc-file" className="block font-semibold">
                File (PDF, Word or photo, up to 10 MB)
              </label>
              <input
                id="doc-file"
                name="file"
                type="file"
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="mt-1 w-full rounded-2xl border-2 border-dashed border-deep/20 bg-white px-3 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-pool/15 file:px-4 file:py-1 file:font-semibold file:text-deep"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-sun px-6 font-bold text-deep shadow-sm hover:bg-yellow-200"
            >
              Upload
            </button>
          </Form>
        </Card>
      </Section>

      <Section title="On the site now">
        {documents.length === 0 ? (
          <Card>
            <p>
              No documents yet. Until you add some, the About page links to the files on the old
              site.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Card className="flex flex-wrap items-center gap-4 p-4">
                  <FileIcon className="size-7 shrink-0 text-coral-text" />
                  <div className="min-w-0 flex-1">
                    <a
                      href={doc.href}
                      className="font-display text-lg font-extrabold underline underline-offset-4"
                    >
                      {doc.title}
                    </a>
                    <p className="text-slate-700">
                      {doc.kind}, {doc.size} · added {doc.uploadedOn} by {doc.uploadedBy}
                    </p>
                  </div>
                  <Form
                    reloadDocument
                    method="post"
                    onSubmit={(e) => {
                      if (!confirm(`Remove “${doc.title}” from the site?`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={doc.id} />
                    <button
                      type="submit"
                      className="rounded-full px-4 font-semibold text-alert underline underline-offset-4 hover:bg-red-50"
                    >
                      Remove<span className="sr-only"> {doc.title}</span>
                    </button>
                  </Form>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
