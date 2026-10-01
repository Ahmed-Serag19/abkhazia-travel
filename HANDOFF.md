# Casa Colina guest site: handoff

Written 2026-10-01 for whoever picks this up next, human or Claude.
The owner console has its own handoff: `../abkhazia-admin/HANDOFF.md`. Read
both; the two apps share one database and some code.

---

## 1. Decisions waiting on Serga

1. **Commit or discard the uncommitted refactor in this repo.** Another session
   made it and never committed it. It makes the site **Postgres-only**:
   - deletes `data/content.json`, `src/lib/data/{fixtures,json-source,content-file,reviews}.ts`,
     `src/lib/db/{seed,ids}.ts`, `scripts/db-seed.mjs`, and the
     `/api/dev-seed` and `/api/admin/seed` routes
   - `getData()` now always returns the database source
   - adds `src/lib/db/health.ts`

   Checked on 2026-10-01: **typecheck, lint, translation check and a full
   production build all pass** (92 pages, exit 0). It works; it just isn't
   saved. Before committing, see items 2.1 and 2.2: it has two consequences.
2. **Abkhaz translation.** `ab` falls back to Russian for 206 strings, and
   every piece of content's `ab` field is empty. It needs a human translator.
   Don't fill it in by guessing; the fallback is deliberate.

## 2. Must fix soon

1. **If the refactor is committed, the build needs the database.** There is no
   fallback any more. A Vercel deploy without `DATABASE_URL` will fail to
   build, not degrade. Check the Vercel project has it.
2. **If the refactor is committed, the console's `npm run sync:core` breaks**,
   because it copies `src/lib/db/ids.ts`, which the refactor deletes. The fix
   is described in the console's handoff, item 2.1.
3. **Check this site's Vercel variables:**
   - `DATABASE_URL` must be set.
   - `NEXT_PUBLIC_DEMO` must be **deleted**. It shows a banner telling guests
     their booking goes nowhere, which stopped being true once the database was
     wired.
   - `REVALIDATE_SECRET` must **equal the console's**, or owner edits take up
     to 5 minutes to appear.
   - `ADMIN_API_SECRET` must be set, or the `/api/admin/*` endpoints refuse
     everything. That's the safe failure, but it's still a failure.
   - `NEXT_PUBLIC_SITE_URL` should be the deployed URL.
4. **Rotate the leaked credentials.** The database password and the
   `sb_secret_…` key were pasted into a chat. Reset both in Supabase and update
   `.env.local` here and in the console, plus both Vercel projects.
5. **The site has no properties.** They were all deleted through the console on
   or around 2026-09-25, so `/stay` is empty. Add real ones in the console.

## 3. Known gaps (backlog)

1. **Nobody is told when a guest sends a booking request.** It's stored and
   appears in the console's inbox, but there's no email or Telegram message.
   Hook point: `TODO(notify)` in `src/app/api/booking-requests/route.ts`.
   `RESEND_API_KEY` / `TELEGRAM_*` are reserved in `.env.example`.
2. **No product photos.** Provisions and rental items have none. `ProductTile`
   draws a tinted icon panel instead. Real photography needs Supabase Storage.
3. **The rate limit on the booking form is per-instance and in-memory.** It
   stops a stuck retry loop, not a real attack. Move it to Redis/Upstash
   before that matters.
4. **Reviews are not editable anywhere.** They live in the `reviews` table
   with a `published` flag, but the console has no screen for them.
5. **Orphaned rows:** deleting a property leaves its host and reviews behind.
   Recreating a property with an old slug brings its old reviews back.
6. `ab` (Abkhaz). See decision 1.2.

## 4. Current state (verified, not assumed)

1. Data comes from Supabase Postgres via Drizzle (`src/lib/data/db-source.ts`).
2. Pages are statically generated and revalidated every 5 minutes, or
   immediately when the console calls `POST /api/revalidate`.
3. Booking requests are written to `booking_requests`. A real POST was tested:
   it returned 201 and was read back through the admin endpoint.
4. Functions are pinned to London (`lhr1`), next to the database.
5. Five layers of error handling, a custom 404, and `/api/admin/health` for
   diagnosis. See `README.md`.
6. Locales: Russian (default, source language), English, Abkhaz. A missing
   English or Abkhaz key falls back to Russian instead of crashing; run
   `npm run i18n:check` after adding any key.

## 5. Where things are

1. Repo: https://github.com/Ahmed-Serag19/abkhazia-travel (branch `main`)
2. Local: `D:\programming\web\abkhazia-travel`, runs on port 3000
3. Supabase project `lkrckfyimnxpigpppfrz`, region **eu-west-2 (London)**,
   transaction pooler `aws-0-eu-west-2.pooler.supabase.com:6543`
4. Secrets live only in `.env.local` (gitignored) and in Vercel. The template is
   `.env.example`. **Never paste them into a chat.**
5. Runbook: `SUPABASE.md` (connection, migration, health, security)
6. Schema: `src/lib/db/schema.ts` → migration `drizzle/0000_initial.sql`; row
   security in `supabase/policies.sql`
7. This repo **owns the domain model**. The console copies `types.ts`,
   `schema.ts` and `mappers.ts` from here with `npm run sync:core`.

## 6. Load-bearing — do not undo

1. **`max_pipeline: 0`** in `src/lib/db/client.ts`. postgres.js pipelines
   queries by default and Supabase's transaction pooler doesn't support it. A
   pipelined query either hangs forever or **returns another query's rows**.
   That happened here: a build died because an excursion came back holding a
   seller's record. `max: 1` is only safe with this on.
2. **`vercel.json` → `"regions": ["lhr1"]`.** Vercel defaults to Washington.
3. **Row level security on every table** (`supabase/policies.sql`). Supabase
   serves the whole `public` schema over HTTP to anyone with the publishable
   key. `booking_requests` deliberately has **no policy**, so nobody can read
   it through that API; it holds guests' phone numbers.
4. **Fonts must include `cyrillic-ext` (U+0460–052F)** or Abkhaz letters break.
   Playfair Display failed this test and was replaced with Lora.
5. **Two irreducible Stay modes.** `compound` = whole houses, priced per night.
   `hosted` = rooms priced per person, with a host. Don't merge them.
6. **Request-to-book.** No card payments on the site, by design.

## 7. For the next Claude

1. Serga is a **frontend developer learning fullstack**. He can't catch
   backend mistakes, so verification is your job.
2. **Run database code against the real database before calling it done.**
   Typechecking is not testing.
3. For an infrastructure bug, **read the vendor docs before guessing.**
4. His terminal is **Windows PowerShell 5.1**: `&&` is a syntax error. Give him
   one command per line.
5. He wants **numbered lists with the open decisions first**. He wants you to
   own visual design.
6. The Supabase MCP server is registered in `~/.claude.json` but **needs
   authenticating** (`/mcp` in a terminal) before its tools work.

## 8. Commands

```bash
npm run dev            # http://localhost:3000
npm run build
npm run i18n:check     # report translation gaps (add --strict for CI)
npm run db:migrate     # create tables + row security (safe to re-run)
npm run db:health      # what is this deployment serving?
```
