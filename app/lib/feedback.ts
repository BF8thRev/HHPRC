import { desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../../db/client";
import { feedback } from "../../db/schema";

export const KINDS = {
  idea: "An idea",
  question: "A question",
  issue: "Something that needs fixing",
} as const;

export const feedbackSchema = z.object({
  kind: z.enum(["idea", "question", "issue"], { message: "Choose what kind of note this is." }),
  message: z
    .string()
    .trim()
    .min(5, "Tell us a little more so we can help.")
    .max(2000, "Please keep it under 2,000 characters."),
  name: z
    .string()
    .trim()
    .max(80)
    .transform((v) => v || null),
  // Only needed if they want an answer.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(""), z.email("That email address doesn't look right.")]))
    .transform((v) => v || null),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(0).optional(),
});

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitFeedback(
  d1: D1Database,
  form: FormData,
  now = new Date(),
): Promise<FeedbackResult> {
  const parsed = feedbackSchema.safeParse({
    kind: String(form.get("kind") ?? ""),
    message: String(form.get("message") ?? ""),
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    website: String(form.get("website") ?? ""),
  });
  if (!parsed.success) {
    // Tell bots it worked; tell people what to fix.
    return parsed.error.issues.some((i) => i.path[0] === "website")
      ? { ok: true }
      : { ok: false, error: parsed.error.issues[0]!.message };
  }
  const { kind, message, name, email } = parsed.data;
  await getDb(d1)
    .insert(feedback)
    .values({ id: crypto.randomUUID(), kind, message, name, email, createdAt: now });
  return { ok: true };
}

/** Open items first, newest first. */
export const listFeedback = (d1: D1Database) =>
  getDb(d1)
    .select()
    .from(feedback)
    .orderBy(desc(isNull(feedback.handledAt)), desc(feedback.createdAt))
    .all();

export async function setHandled(d1: D1Database, id: string, handled: boolean, now = new Date()) {
  await getDb(d1)
    .update(feedback)
    .set({ handledAt: handled ? now : null })
    .where(eq(feedback.id, id));
}

export async function deleteFeedback(d1: D1Database, id: string) {
  await getDb(d1).delete(feedback).where(eq(feedback.id, id));
}
