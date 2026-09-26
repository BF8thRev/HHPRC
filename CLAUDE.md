# CLAUDE.md — Huntington Hills Swim & Racquet Club (hhprc.club)

Full spec: `docs/SPEC.md`. Read it before any task. If this file and the spec disagree, the spec wins; flag the conflict.

## What we're building

A warm, family-friendly website for a neighborhood pool club of 252 homes: clear public info (hours, events, rules), a live editor any board member can use from a phone, household logins, automated dues via Stripe, and a members-only Neighbors Board. It must be maintainable by non-technical volunteers.

## Stack (locked — do not substitute without asking)

- TypeScript (strict), pnpm, Node 22 LTS
- React Router v7 (framework mode) on Cloudflare Workers via Wrangler
- Cloudflare D1 + Drizzle ORM (migrations in `db/`), R2 for files, Cron Triggers, Turnstile
- Better Auth with the magic-link plugin (no passwords)
- Stripe Checkout + webhooks (ACH default, card second)
- Brevo or Amazon SES for email
- Tailwind v4 with design tokens, TipTap for rich text, Zod for all input, rrule for repeating events
- Vitest (logic) + Playwright (key flows)

## Repo layout

- `app/` routes and components; `app/content/blocks.ts` block schemas
- `db/` schema, migrations, seed
- `workers/` cron jobs and webhooks
- `emails/` templates
- `docs/` SPEC.md and admin how-to guides

## Rules

- Build one phase at a time (see "Build phases" in the spec). Plan first, wait for approval, then build on a branch named `phase-N-*`.
- Anything that changes year to year is data, never code: dues amounts and dates live in the `seasons` table; hours in `hours_schedules`; content in `blocks`.
- Editors pick from fixed block types and cannot change layout, colors or fonts.
- Every permission check happens on the server, not just in the UI.
- Money is stored in integer cents.
- All dates and schedules use America/New_York. Cron Triggers run in UTC — convert and handle daylight saving.
- Stripe webhooks: verify signatures, store processed event ids (idempotent). ACH is not instant: checkout → Processing; Paid only on async payment succeeded; async payment failed → back to Due and email the household.
- Magic links: single-use, 15-minute expiry, max 5 per email per hour.
- The first admin is created by a seed command, never a public signup.
- Member and payment data never go to GitHub; only published content snapshots do.
- The AI update box proposes edits validated against block schemas; a human must approve; it can never touch dues, payments, roles or email sends.
- Photos are resized in the browser (max 2000px, WebP) before upload to R2.
- Minimal child data: first name and birth year only, optional. No children's photos on the Neighbors Board.
- Dev emails are logged, never sent. Use Stripe test mode outside production.

## Design and copy

- Theme: "A summer day at the club." Pool blue #0EA5E9, deep water #0C4A6E, sunshine #FACC15, coral #F97316, lifeguard red #DC2626 (alerts only), grass green #16A34A, sand #FFF7ED.
- Nunito/Quicksand headings, Inter body, 17px minimum body text, WCAG AA, 44px tap targets, never color alone for status.
- Phone first (380px). One primary button per screen.
- Copy is warm and plain: lead with the fact, dates as weekday + month + day + time, no ALL CAPS, every announcement ends with the next step.

## Definition of done (every PR)

- Typecheck, lint, tests and build pass in CI
- Tests cover any dues, late-fee, recurrence or webhook logic touched
- Works at 380px wide and passes an accessibility check
- Spec updated if a decision changed

## Commands

One-time setup: `docs/SETUP.md`.

- `pnpm dev` — dev server at http://localhost:5173 (local D1 in `.wrangler/`)
- `pnpm typecheck` / `pnpm lint` / `pnpm format`
- `pnpm test` — Vitest inside workerd, fresh migrated D1 per file
- `pnpm test:e2e` — Playwright at 380px + desktop with axe accessibility checks
- `pnpm db:generate --name <change>` — write a migration from `db/schema.ts` changes
- `pnpm db:migrate:local | db:migrate:preview | db:migrate:prod` — apply migrations
- `pnpm db:seed --env local|preview|prod [--admin-email x] [--confirm]` — prod requires `--confirm`
- `pnpm build`, `pnpm run deploy` (use `run`: `pnpm deploy` is a pnpm built-in). CI deploys `main` automatically.
- PRs get a preview at `pr-<n>-hhprc-preview.<account>.workers.dev` using the `hhprc-preview` Worker and D1.

## Version notes

- React Router is pinned to 7.x (the stack says v7; v8 is out). TypeScript is pinned to 6.0 until typescript-eslint supports 7.
- `compatibility_date` must not be newer than the workerd bundled with `@cloudflare/vitest-pool-workers`, or tests won't start.
