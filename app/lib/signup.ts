import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../../db/client";
import { emailSignups } from "../../db/schema";
import { sendToGoogle } from "./gmail-sync";

export const signupSchema = z.object({
  // Trim before checking so a stray space from autofill isn't an error.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter an email address like name@example.com.")),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(0).optional(),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

/**
 * Saves an address for club news. Signing up twice is fine and says the same
 * thing, so the form never reveals who is already on the list.
 */
export async function signUp(
  env: Pick<Env, "DB" | "SIGNUP_WEBHOOK_URL" | "SIGNUP_WEBHOOK_SECRET">,
  form: FormData,
  now = new Date(),
  fetcher: typeof fetch = fetch,
) {
  const parsed = signupSchema.safeParse({
    email: String(form.get("email") ?? ""),
    website: String(form.get("website") ?? ""),
  });
  if (!parsed.success) {
    const botTrap = parsed.error.issues.some((i) => i.path[0] === "website");
    // Tell bots it worked; tell people what to fix.
    return botTrap
      ? ({ ok: true } as const)
      : ({ ok: false, error: parsed.error.issues[0]!.message } as const);
  }

  const db = getDb(env.DB);
  await db
    .insert(emailSignups)
    .values({ email: parsed.data.email, createdAt: now })
    .onConflictDoNothing();

  // Pass it on to Google now; if that fails the hourly cron retries.
  if (await sendToGoogle(env, parsed.data.email, now, fetcher)) {
    await db
      .update(emailSignups)
      .set({ syncedAt: now })
      .where(eq(emailSignups.email, parsed.data.email));
  }
  return { ok: true } as const;
}
