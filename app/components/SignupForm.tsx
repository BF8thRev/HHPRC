import { useFetcher } from "react-router";

import type { SignupResult } from "../lib/signup";
import { ArrowIcon, CheckIcon } from "./icons";

/**
 * "Get club news by email". Posts to the home page's action. With JavaScript
 * it updates in place; without it, the page reloads with the same message.
 */
export function SignupForm({ fallback }: { fallback?: SignupResult }) {
  const fetcher = useFetcher<SignupResult>();
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
          <strong className="block font-display text-lg">You're on the list!</strong>
          We'll email you before the members meeting and opening day.
        </span>
      </p>
    );
  }

  const error = result && !result.ok ? result.error : undefined;
  return (
    <fetcher.Form method="post" action="/?index" noValidate className="space-y-3">
      <label htmlFor="signup-email" className="block font-semibold">
        Your email
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="name@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "signup-error" : "signup-hint"}
          className="w-full flex-1 rounded-full border-2 border-deep/20 bg-white px-5 text-deep placeholder:text-slate-500 focus:border-pool focus:outline-none aria-[invalid]:border-alert"
        />
        {/* Honeypot for bots. Hidden from people and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px]">
          <label>
            Leave this empty
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 font-bold text-deep shadow-sm hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-70"
        >
          {busy ? "Signing you up…" : "Sign me up"}
          <ArrowIcon />
        </button>
      </div>
      {error ? (
        <p id="signup-error" role="alert" className="font-semibold text-alert">
          {error}
        </p>
      ) : (
        <p id="signup-hint" className="text-slate-600">
          A few emails a year. No spam, and never shared.
        </p>
      )}
    </fetcher.Form>
  );
}
