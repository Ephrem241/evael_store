<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Evael Store: guide for coding agents

An online shop for Ethiopia. Customers browse, add to a cart, check out with
cash on delivery and follow their orders. Staff run the shop from `/admin`.
Every screen is in English and Amharic, and prices are in ETB. The README has
the full setup, test and go-live guide. This file covers the rules you need to
change code safely.

**Stack:** Next.js 16 (App Router; read the note above), React 19, TypeScript,
Tailwind CSS 4, shadcn/ui on `radix-ui`, Framer Motion, Supabase (Postgres,
Auth, Storage, RLS), Zod 4, React Hook Form, Zustand, Resend (email), Google
Gemini (`@google/genai`, the shopping assistant). Node 20.9 or newer.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run lint           # ESLint, including the React purity rules
npx tsc --noEmit       # type-check
npm run check:i18n     # fails on hard-coded UI text
npm test               # Vitest unit tests (src/**/*.test.ts), no network
npm run build          # production build
npm run test:e2e       # Playwright against the build, uses the REAL Supabase in .env
```

Before you call a change done, run `lint`, `tsc --noEmit`, `check:i18n` and
`npm test`. Run `test:e2e` only when the user asks for it or the change needs
it. It creates and deletes `e2e-*@example.com` accounts and `e2e-` products in
the Supabase project named in `.env`, so never point it at a shop that has
live orders.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/` | Routes (storefront, `account/`, `admin/`, `api/assistant`, `api/email/dispatch`, `auth/callback`) |
| `src/components/<area>/` | UI grouped by area (`home`, `product`, `catalog`, `cart`, `checkout`, `account`, `admin`, ...). `ui/` holds the shared primitives |
| `src/lib/services/` | **All data access.** `*-queries.ts` run on the server, `*-client.ts` and `*-remote.ts` run in the browser, and the plain modules (`catalog.ts`, `homepage.ts`) are pure helpers |
| `src/lib/store/` | Zustand stores (cart, favorites, auth, assistant, ...) |
| `src/lib/i18n/`, `src/locales/{en,am}/` | Translation system and dictionaries |
| `src/lib/supabase/` | `client.ts` for the browser, `server.ts` for the server |
| `src/lib/email/`, `src/lib/ai/` | Resend email outbox and the Gemini assistant |
| `src/proxy.ts` | Next 16's replacement for `middleware.ts`: protects `/account`, `/checkout`, `/orders`, `/order` and `/admin` on the server, and handles `?lang=` |
| `supabase/migrations/` | Numbered SQL migrations (`0001` to `0030`) |
| `scripts/` | Seed scripts, the i18n checker, the secrets checker and the smoke test |
| `e2e/` | Playwright specs. `e2e/support/` holds the setup, teardown and safety rules |
| `docs/design/` | Redesign specs and mockups |

## Rules

**Data and security**
- Components never query Supabase directly. Add or extend a function in
  `src/lib/services/` and call that.
- Keep pure logic (pricing, filters, mappers) out of files that import
  `next/headers` or a Supabase client, so client components can still import it
  and it stays unit-testable.
- The database decides order prices, delivery fees, stock and payment status in
  `place_order`. Never trust or compute those totals in the browser for
  anything that gets saved.
- RLS is on for every table. A new table needs RLS policies in the same
  migration.
- The app never uses `SUPABASE_SERVICE_ROLE_KEY`. Only the seed scripts and the
  e2e setup use it. Never give a server secret (`SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY`, `GEMINI_API_KEY`, `EMAIL_DISPATCH_SECRET`) a `NEXT_PUBLIC_`
  prefix. `src/lib/env-check.ts` refuses to start the server if you do.
- `/admin` is guarded in layers. `proxy.ts` redirects non-admins on the server,
  and RLS (`is_admin()`) is the check that actually counts. The
  `use-require-admin` hook in the browser is a backup. Keep all three.

**Database changes**
- Add a new numbered file in `supabase/migrations/` (the next one is `0031_...`).
  Never edit a migration that has already shipped.
- Make migrations safe to re-run where you can, and make copy updates
  conditional on the old wording, as `0024` and `0025` do.
- `combined-migration.sql` covers `0001` to `0017` only, so leave it alone for
  new migrations.
- If the change affects setup or what the admin controls, update the README's
  migration range and the "What an admin controls" section.

**Text and languages**
- Never hard-code UI text. Add the key to `src/locales/en/<area>.ts` and the
  same key to `src/locales/am/<area>.ts`. A missing Amharic key is a compile
  error, and the dictionary tests check that placeholders match.
- Use `const t = useT()` in Client Components and `const t = await getT()` in
  Server Components or `generateMetadata`.
- When `check:i18n` flags a string that is not shown to users, add
  `// i18n-ignore: <reason>` to the line.
- Write the Amharic properly, in Ethiopic script. A native speaker will review
  it.

**Design**
- Every colour comes from the `--evael-*` tokens in `src/app/globals.css`,
  exposed as Tailwind colours (`brand`, `brand-strong`, `brand-ink`,
  `brand-soft`, `gold`, `gold-ink`, `subtle`, `sale`, ...). Do not use raw hex
  values or Tailwind palette colours in components. The only exceptions are
  `src/lib/brand-mark.ts` and `src/lib/email/templates.ts`, which mirror the
  tokens.
- Keep WCAG AA contrast: white text goes on `brand-strong`, small burgundy text
  uses `brand-ink`, and small gold text uses `gold-ink`.
- Headings use `font-display` (Playfair Display) and body text uses Inter.
  Fonts are self-hosted in `src/app/fonts`, so don't add Google Fonts links.
- Check every UI change at phone width (390 px) as well as desktop. The
  storefront has separate phone layouts (bottom nav, phone bars).
- Use the existing primitives in `src/components/ui/` before you add new ones.

**Content honesty**
- Never invent shop facts such as contact details, return windows, countdowns
  or delivery fees. If the `store_settings` row is missing, the UI says the
  detail is coming or hides it.
- The assistant may only use facts the server gives it
  (`src/lib/ai/assistant-prompt.ts`), and the server checks every product link
  it returns.

**Tests**
- Put a `*.test.ts` file next to any pure logic you add or change. Vitest runs
  in Node, so async Server Components are not unit-tested; the e2e suite covers
  pages.
- e2e data must stay inside the `e2e-` namespace. The teardown refuses to
  delete anything else.

## Git

- Commit straight to `main` (no feature branches). Run `git fetch` and rebase
  on `origin/main` before you push.
- Use Conventional Commit messages, as the history does: `feat(home): ...`,
  `fix(mobile): ...`, `chore: ...`.
- Never commit `.env` or any file with a real key. `npm run check:secrets`
  checks the build output and git for leaked keys.
