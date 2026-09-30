import { useFetcher } from "react-router";

import { KINDS, type FeedbackResult } from "../lib/feedback";
import { ArrowIcon, CheckIcon } from "./icons";

const field =
  "mt-1 w-full rounded-2xl border-2 border-deep/20 bg-white px-4 py-2 text-deep placeholder:text-slate-500 focus:border-pool focus:outline-none";

/**
 * "Share an idea, question or issue". Posts to /contact. With JavaScript it updates in
 * place; without it, the page reloads with the same message.
 */
export function FeedbackForm({ fallback }: { fallback?: FeedbackResult }) {
  const fetcher = useFetcher<FeedbackResult>();
  const result = fetcher.data ?? fallback;
  const busy = fetcher.state !== "idle";

  if (result?.ok) {
    return (
      <p
        role="status"
        className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-green-900"
      >
        <CheckIcon className="mt-0.5 size-6 shrink-0" />
        <span>
          <strong className="block font-display text-lg">Thank you, we got it.</strong>A board
          member will read it. If you left an email, we'll write back there.
        </span>
      </p>
    );
  }

  const error = result && !result.ok ? result.error : undefined;
  return (
    <fetcher.Form method="post" action="/contact" noValidate className="space-y-4">
      <fieldset>
        <legend className="font-semibold">What is this?</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {Object.entries(KINDS).map(([value, label], i) => (
            <label
              key={value}
              className="flex min-h-11 items-center gap-2 rounded-full border-2 border-deep/20 bg-white px-4 font-semibold has-[:checked]:border-pool has-[:checked]:bg-pool/10"
            >
              <input
                type="radio"
                name="kind"
                value={value}
                defaultChecked={i === 0}
                className="size-5"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="fb-message" className="block font-semibold">
          Your message
        </label>
        <textarea
          id="fb-message"
          name="message"
          rows={5}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "fb-error" : undefined}
          className={field}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fb-name" className="block font-semibold">
            Your name (optional)
          </label>
          <input id="fb-name" name="name" autoComplete="name" className={`${field} min-h-11`} />
        </div>
        <div>
          <label htmlFor="fb-email" className="block font-semibold">
            Your email, if you'd like an answer
          </label>
          <input
            id="fb-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`${field} min-h-11`}
          />
        </div>
      </div>
      {/* Honeypot for bots. Hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave this empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <p id="fb-error" role="alert" className="font-semibold text-alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sun px-8 font-bold text-deep shadow-sm hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-70"
      >
        {busy ? "Sending…" : "Send to the board"}
        <ArrowIcon />
      </button>
    </fetcher.Form>
  );
}
