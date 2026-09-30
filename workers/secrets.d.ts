// Secrets aren't in wrangler.jsonc (they're set with `wrangler secret put`), so wrangler
// can't generate their types. Optional: the site works without them.
interface Env {
  /** Google Apps Script web app that adds sign-ups to the club's Google Sheet. */
  SIGNUP_WEBHOOK_URL?: string;
  SIGNUP_WEBHOOK_SECRET?: string;
}
