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

## Custom domain

When ready to go live: Workers & Pages → hhprc → Settings → Domains & Routes → add `hhprc.club`.
