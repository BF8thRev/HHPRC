# One-time setup

Steps a maintainer does once. Everything else is in the Commands section of `CLAUDE.md`.

## Local machine

1. Install Node 22 or newer and pnpm (`npm i -g pnpm`).
2. `pnpm install`
3. Copy `.dev.vars.example` to `.dev.vars`.
4. `pnpm db:migrate:local`, then `pnpm db:seed --env local`
5. `pnpm dev` and open http://localhost:5173

## Cloudflare

1. `pnpm wrangler login`
2. Create the two databases:
   - `pnpm wrangler d1 create hhprc-prod`
   - `pnpm wrangler d1 create hhprc-preview`
3. Paste each `database_id` into `wrangler.jsonc`, replacing `REPLACE_WITH_PROD_D1_ID` and `REPLACE_WITH_PREVIEW_D1_ID`.
4. `pnpm db:migrate:prod` and `pnpm db:migrate:preview`
5. Create an API token (My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template, then add **Account → D1 → Edit**). Note your Account ID from the dashboard sidebar.

## GitHub

1. Repository → Settings → Secrets and variables → Actions → add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Settings → Environments → create `production`. Add yourself as a required reviewer if production deploys should wait for approval.
3. Settings → Branches → protect `main`: require a pull request and the `CI / check` status.

## Board portal (/board)

Board members upload documents at `/board`. Cloudflare Access handles sign-in (a one-time code by
email, free for up to 50 people), and the site re-checks every request on the server. Files are
stored in R2.

1. **Storage.** In the Cloudflare dashboard, open **R2** and turn it on. Then create two buckets:
   `hhprc-docs` and `hhprc-docs-preview`.
2. **Sign-in.** Open **Zero Trust**. The first time, pick a team name (for example `hhprc`) and the
   Free plan. Then go to **Access → Applications → Add an application → Self-hosted**:
   - Application name: `HHPRC board portal`
   - Public hostname: `hhprc.hhprc.workers.dev` with path `board`, and a second public hostname
     entry with path `admin` (the site editor and the private inbox). When `hhprc.club` is live, add
     both paths for `hhprc.club` too. Don't protect `/files`; uploaded documents are public.
   - Policy: **Allow**, with a rule for **Emails** listing each board member's address.
   - Login method: **One-time PIN**.
3. **Tell the site.** Copy the application's **Application Audience (AUD) Tag** from its overview
   page. In `wrangler.jsonc`, under the top-level `vars`, set `ACCESS_AUD` to that tag and
   `ACCESS_TEAM_DOMAIN` to `<team>.cloudflareaccess.com`.
4. **API token.** Edit the `CLOUDFLARE_API_TOKEN` token and add **Account → Workers R2 Storage →
   Edit**, so deploys can reach the buckets.

To add or remove a board member later, edit the Access policy's email list. No code change is needed.

Locally, `DEV_BOARD_EMAIL` in `.dev.vars` stands in for sign-in. It is ignored everywhere except
`APP_ENV=development`.

## Custom domain

When ready to go live: Workers & Pages → hhprc → Settings → Domains & Routes → add `hhprc.club`.

## Google Sheet sign-ups and the private inbox

- Sign-ups to the club's Google Sheet: follow `docs/GMAIL-SIGNUPS.md`, then set the two secrets it names.
- The private ideas/questions inbox belongs to `FEEDBACK_OWNER_EMAIL` in `wrangler.jsonc`. That address must also be on the Access policy's email list.
- Board members sign in with an emailed code. See `docs/ADMIN-GUIDE.md`.
- Apply the new database migration before deploying: `pnpm db:migrate:prod`.
