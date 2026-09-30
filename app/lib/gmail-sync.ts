// Passes news sign-ups on to the club's Google Sheet (and Gmail Contacts) through a small
// Google Apps Script web app that lives in the club's Google account. See docs/GMAIL-SIGNUPS.md.
// The address is always saved in our own database first; this only adds the copy in Google,
// and anything that fails is retried by the hourly cron.
import { eq, isNull } from "drizzle-orm";

import { getDb } from "../../db/client";
import { emailSignups } from "../../db/schema";

type SyncEnv = Pick<Env, "DB" | "SIGNUP_WEBHOOK_URL" | "SIGNUP_WEBHOOK_SECRET">;

/** Sends one address to Google. Returns true only if the script confirmed it. */
export async function sendToGoogle(
  env: Pick<Env, "SIGNUP_WEBHOOK_URL" | "SIGNUP_WEBHOOK_SECRET">,
  email: string,
  createdAt: Date,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!env.SIGNUP_WEBHOOK_URL || !env.SIGNUP_WEBHOOK_SECRET) return false;
  try {
    const res = await fetcher(env.SIGNUP_WEBHOOK_URL, {
      method: "POST",
      // text/plain keeps Apps Script from rejecting the request; the script parses the JSON itself.
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        secret: env.SIGNUP_WEBHOOK_SECRET,
        email,
        signedUpAt: createdAt.toISOString(),
      }),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body.ok === true;
  } catch {
    return false;
  }
}

/** Forwards every address not yet sent. Safe to run again and again. */
export async function syncSignups(env: SyncEnv, fetcher: typeof fetch = fetch, now = new Date()) {
  const db = getDb(env.DB);
  const pending = await db
    .select()
    .from(emailSignups)
    .where(isNull(emailSignups.syncedAt))
    .limit(50);
  let sent = 0;
  for (const row of pending) {
    if (await sendToGoogle(env, row.email, row.createdAt, fetcher)) {
      await db.update(emailSignups).set({ syncedAt: now }).where(eq(emailSignups.email, row.email));
      sent++;
    }
  }
  return { pending: pending.length, sent };
}
