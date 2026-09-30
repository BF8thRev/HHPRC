import { Form, Link } from "react-router";

import { CheckIcon } from "../components/icons";
import { Card, PageHeader, Section } from "../components/ui";
import { club } from "../content/sample";
import { isSectionKey, type SectionKey } from "../content/blocks";
import { requireBoard } from "../lib/access";
import { fromForm, specs, toRows, type Field } from "../lib/admin-forms";
import { getContent, resetContent, saveContent } from "../lib/content";
import type { Route } from "./+types/admin-edit";

export function meta(_: Route.MetaArgs) {
  return [{ title: `Edit | ${club.shortName}` }, { name: "robots", content: "noindex" }];
}

function sectionOf(param: string | undefined): SectionKey {
  if (!param || !isSectionKey(param))
    throw new Response("That isn't something you can edit.", { status: 404 });
  return param;
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  await requireBoard(request, env);
  const key = sectionOf(params.section);
  const spec = specs[key];
  const rows = toRows(key, await getContent(env.DB, key));
  const blanks = Array.from({ length: spec.spareRows }, () => ({}) as Record<string, string>);
  return { key, spec, rows: [...rows, ...blanks] };
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  const email = await requireBoard(request, env);
  const key = sectionOf(params.section);
  const form = await request.formData();

  if (form.get("intent") === "reset") {
    if (!specs[key].resettable)
      return { ok: false as const, message: "That part can't be reset. Edit the values instead." };
    await resetContent(env.DB, key);
    return { ok: true as const, message: "Back to the starter text." };
  }

  const values = fromForm(key, form);
  if (!values.ok) return { ok: false as const, message: values.error };
  const saved = await saveContent(env.DB, key, values.value, email);
  return saved.ok
    ? { ok: true as const, message: "Saved. The site is updated." }
    : { ok: false as const, message: saved.error };
}

const isDayField = (f: Field) => /^d\d[oc]$/.test(f.name);

const inputClass =
  "mt-1 w-full rounded-2xl border-2 border-deep/20 bg-white px-4 py-2 focus:border-pool focus:outline-none";

function FieldInput({
  field,
  id,
  name,
  value,
}: {
  field: Field;
  id: string;
  name: string;
  value: string;
}) {
  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={value === "on"}
          className="size-6"
        />
        {field.label}
        {field.hint && <span className="font-normal text-slate-700"> ({field.hint})</span>}
      </label>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea id={id} name={name} rows={3} defaultValue={value} className={inputClass} />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={name}
          defaultValue={value || field.options![0]!.value}
          className={inputClass}
        >
          {field.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={field.type === "money" ? "text" : field.type}
          inputMode={field.type === "money" ? "decimal" : undefined}
          defaultValue={value}
          placeholder={field.placeholder}
          aria-describedby={field.hint ? `${id}-hint` : undefined}
          className={`${inputClass} min-h-11`}
        />
      )}
      {field.hint && (
        <p id={`${id}-hint`} className="mt-1 text-slate-700">
          {field.hint}
        </p>
      )}
    </div>
  );
}

export default function AdminEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { key, spec, rows } = loaderData;
  return (
    <>
      <PageHeader title={spec.title} intro={spec.intro} />
      <Section title="Make your changes">
        <p className="mb-5">
          <Link to="/admin" className="font-semibold underline underline-offset-4">
            Back to the list
          </Link>
        </p>
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
        {/* Full page posts so every request passes through Cloudflare Access. */}
        <Form reloadDocument method="post" className="space-y-5">
          {rows.map((row, i) => (
            <Card key={i} className="space-y-4">
              <h3 className="font-display text-xl font-extrabold">
                {spec.shape === "single" ? spec.rowLabel : `${spec.rowLabel} ${i + 1}`}
                {!row.title && spec.shape === "list" && " (new)"}
              </h3>
              {row.id && <input type="hidden" name={`${i}.id`} value={row.id} />}
              {spec.fields
                .filter((f) => !isDayField(f))
                .map((f) => (
                  <FieldInput
                    key={f.name}
                    field={f}
                    id={`${key}-${i}-${f.name}`}
                    name={`${i}.${f.name}`}
                    value={row[f.name] ?? ""}
                  />
                ))}
              {spec.fields.some(isDayField) && (
                <fieldset>
                  <legend className="font-semibold">
                    Hours each day (leave both empty if the pool is closed)
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {spec.fields.filter(isDayField).map((f) => (
                      <FieldInput
                        key={f.name}
                        field={f}
                        id={`${key}-${i}-${f.name}`}
                        name={`${i}.${f.name}`}
                        value={row[f.name] ?? ""}
                      />
                    ))}
                  </div>
                </fieldset>
              )}
            </Card>
          ))}
          <button
            type="submit"
            name="intent"
            value="save"
            className="min-h-11 rounded-full bg-sun px-8 font-bold text-deep shadow-sm hover:bg-yellow-300"
          >
            Save changes
          </button>
        </Form>

        {spec.resettable && (
          <Form
            reloadDocument
            method="post"
            className="mt-8"
            onSubmit={(e) => {
              if (!confirm("Throw away every change to this part and go back to the starter text?"))
                e.preventDefault();
            }}
          >
            <button
              type="submit"
              name="intent"
              value="reset"
              className="min-h-11 rounded-full px-4 font-semibold text-alert underline underline-offset-4 hover:bg-red-50"
            >
              Undo all my changes here
            </button>
          </Form>
        )}
      </Section>
    </>
  );
}
