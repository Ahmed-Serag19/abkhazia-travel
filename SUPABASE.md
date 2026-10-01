# Wiring Supabase

Project: `lkrckfyimnxpigpppfrz`

The site reads only from Postgres — there is no local content file or seed
data to fall back to. **Without `DATABASE_URL` the build fails**, which is
deliberate: a deploy that quietly served made-up listings is worse than one
that refuses to build.

---

## 1. Get the connection string

Supabase → **Project Settings → Database → Connection string → Transaction
pooler**. It looks like:

```
postgresql://postgres.lkrckfyimnxpigpppfrz:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**Port 6543, not 5432.** The direct connection gives each client its own
backend process; a Vercel deployment under load opens more of those than the
project allows and the site starts returning 500s that look random. The pooler
multiplexes them. It is also why `prepare: false` is set in
[`src/lib/db/client.ts`](src/lib/db/client.ts) — prepared statements belong to
one backend, and the pooler hands you a different one each time.

If you never set a database password (projects created through the dashboard
often have none), set one under **Database → Reset database password** first.

### The two settings that are easy to get wrong

**Region.** Vercel runs functions in `iad1` (Washington) unless told
otherwise. This database is in `eu-west-2` (London), so every query crossed
the Atlantic. `vercel.json` pins both apps to `lhr1`. If you ever move the
database, move this with it.

**Pipelining.** [`src/lib/db/client.ts`](src/lib/db/client.ts) uses
Supabase's documented serverless settings — pool of 1, `prepare: false`,
`ssl: "require"` — plus `max_pipeline: 0`. postgres.js pipelines queries by
default and the transaction pooler does not support it: a pipelined query is
either never answered (the page hangs with no error) or answered with
another query's rows. Both happened here. Supabase's own docs warn about it:
https://supabase.com/docs/guides/database/connecting-to-postgres

The two are related: pool size 1 is only safe *because* pipelining is off.
With it on, one connection is the worst possible setting.

## 2. Fill in `.env.local`

```ini
DATABASE_URL=postgresql://postgres.lkrckfyimnxpigpppfrz:...@...pooler.supabase.com:6543/postgres
ADMIN_API_SECRET=<32 random bytes>
REVALIDATE_SECRET=<32 different random bytes>
```

Generate the secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env.local` is gitignored. Nothing here is ever committed.

## 3. Create the tables

```bash
npm run db:migrate
```

Runs [`drizzle/0000_initial.sql`](drizzle/0000_initial.sql) statement by
statement, then [`supabase/policies.sql`](supabase/policies.sql). Safe to run
again — "already exists" counts as success.

It deliberately does **not** use `drizzle-kit push`. Push diffs the live
database against the schema and invents the DDL to close the gap; that is a
reasonable tool on a laptop and a bad thing to put in a deploy step, because
one of the moves it can choose is `drop table`.

The last thing it prints is which tables have row level security and how many
policies each has. Anything showing `OFF` is reachable by anyone holding the
anon key.

## 4. Add content

Through the owner console (`abkhazia-admin`), which writes to the same
database. A fresh database is empty and the site renders empty lists until
something is added.

## 5. Check it

```bash
npm run db:health
```

```
  serving        db
  DATABASE_URL   set
  reachable      yes (74 ms)
  schema         applied

     0  properties
```

This exists because four different problems look identical from a browser: no
database configured, configured but unreachable, reachable but never
migrated, migrated but never seeded. Each wants a different fix.

## 6. Vercel

Project → Settings → Environment Variables:

| name | value |
|---|---|
| `DATABASE_URL` | the pooler string from step 1 |
| `ADMIN_API_SECRET` | same as local, or a different one |
| `REVALIDATE_SECRET` | same |
| `NEXT_PUBLIC_SITE_URL` | the deployed URL |

Tick **Production and Preview** for `DATABASE_URL` — a build without it
fails. Env var changes only reach deployments built after them, so redeploy.

---

## Security

`supabase/policies.sql` turns on row level security for every table, because
Supabase exposes the whole `public` schema over HTTP through PostgREST, and
the anon key that reaches it is meant to be public. With RLS off, "public
schema" and "readable by anybody who has ever seen the key" are the same
sentence.

- **Catalogue tables** get a public read policy. That content is on the
  website anyway.
- **`reviews`** is readable only where `published = true`, so a review can be
  held back before the owner has seen it.
- **`booking_requests` gets no policy at all.** Under RLS that means nobody
  reaches it except roles that bypass RLS — the app's own connection and the
  `service_role` key. It holds names, emails and phone numbers.

The `/api/admin/*` endpoints take a bearer token (`ADMIN_API_SECRET`),
compared in constant time, and **fail closed**: if the variable is unset they
refuse everything rather than exposing the booking inbox. `/api/revalidate`
now does the same — it used to fall back to `"dev-secret"`, which is in the
repo and therefore not a secret.

The `service_role` key bypasses RLS entirely. It must never appear in a
`NEXT_PUBLIC_*` variable or anywhere the browser can read.

## Caching

Pages are statically generated. Two things bring a database edit to the site:

1. the owner console calls `POST /api/revalidate` after a write — seconds;
2. `export const revalidate = 300` in `src/app/[locale]/layout.tsx` — a floor
   under that, so an edit made directly in the Supabase table editor still
   appears within five minutes instead of waiting for the next deploy.

## API surface

Guest, public:

```
GET  /api/properties            GET /api/properties/[slug]
GET  /api/sellers               GET /api/sellers/[slug]
GET  /api/provisions            GET /api/provisions/[slug]
GET  /api/rentals               GET /api/rentals/[slug]
GET  /api/excursions            GET /api/excursions/[slug]
GET  /api/reviews/[slug]
POST /api/booking-requests      (rate limited, zod validated)
```

Owner, bearer token:

```
GET   /api/admin/health
GET   /api/admin/booking-requests           ?limit=200, no-store
PATCH /api/admin/booking-requests/[id]      { status }
```

All of them return the same envelope on failure —
`{ error, message, reference }` — with the reference also in the server log.

## Not done

- **Nobody is told when a request arrives.** The insert commits and that is
  the end of it. `RESEND_API_KEY` / `TELEGRAM_BOT_TOKEN` are reserved in
  `.env.example`; the hook is marked `TODO(notify)` in
  `src/app/api/booking-requests/route.ts`.
- **The console's login authenticates nobody.** Supabase Auth is the intended
  answer and `@supabase/ssr` is already a dependency.
