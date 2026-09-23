# Casa Colina — Abkhazia travel platform

Mobile-first Next.js site for renting places to stay, ordering food from local
farms, renting gear by the day, and booking excursions along the Abkhaz coast.

**Booking model:** request-to-book. No card payments on the site — a guest
submits a request, the owner confirms and settles payment off-site.

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Stack

| Layer | Choice |
|---|---|
| App + API | Next.js 16 (App Router), Server Components + Server Actions |
| Styling | Tailwind v4 (tokens in `src/app/globals.css`) |
| i18n | `next-intl`, locales `ru` (default) / `en` / `ab` |
| Database | Postgres on Supabase, accessed with Drizzle |
| Storage / Auth | Supabase Storage (photos), Supabase Auth (owner dashboard) |
| Hosting | Vercel |

Next.js is the backend for app logic — there is no separate server. Supabase
supplies the database, file storage and auth.

## Content model

Five categories, matching the site navigation:

- **Stay** — `Property`, in two modes:
  - `compound` (e.g. *Ahmad Farm*) → `Unit[]`, each a whole house with its own
    nightly price and calendar.
  - `hosted` (e.g. *Moaz Farm*) → `Host` + `Room[]`, priced **per person**,
    with a `quantity` of each room type the host can offer.
- **From the village** — `Seller` → `Provision[]` (milk, matsoni, honey, eggs…).
- **Cars** — `RentalItem[]` where `category === "car"`, by the day, with a
  deposit. Route `/cars`, detail `/cars/[slug]`.
- **Rent items** — every other `RentalItem` (SUP boards, kayaks, loungers,
  tables, tents, bikes). A **flat list** in the UI, but each item still carries
  its `category` in the data so it can be grouped later without a migration.
  Route `/rent`, detail `/rent/[slug]`.
- **Explore** — `Excursion[]` priced per person.

`/cars/[slug]` and `/rent/[slug]` share `components/site/RentalDetail.tsx` —
same page, two URL namespaces.

All five converge on one write path: `BookingRequest`.

Types live in [`src/lib/types.ts`](src/lib/types.ts).

## Category icons

The five home tiles use 3D-render illustrations from `public/icons/<key>.svg`
(`stay`, `village`, `cars`, `rent`, `explore`) — the icon *is* the picture, no
separate glyph. The files there now are Fluent Emoji placeholders; the
generation recipe and swap instructions are in
[`public/icons/README.md`](public/icons/README.md).

## Dummy data → real API

Pages never import fixtures directly. They call:

```ts
const data = getData();
const stays = await data.listProperties();
```

`getData()` ([`src/lib/data/index.ts`](src/lib/data/index.ts)) returns one of four
implementations of the same `DataSource` interface:

| source | where it reads from |
|---|---|
| `db` | Supabase Postgres via Drizzle — [`db-source.ts`](src/lib/data/db-source.ts) |
| `json` | [`data/content.json`](data/content.json), the file the owner console edits |
| `fixtures` | [`src/lib/data/fixtures.ts`](src/lib/data/fixtures.ts) — the original seed |
| `api` | `fetch` against `src/app/api/*` route handlers |

**Which one is chosen is a consequence of configuration, not a flag:** set
`DATABASE_URL` and it is `db`, leave it unset and it is `json`. `DATA_SOURCE`
overrides that explicitly when you want the file while the database exists.

Pages and route handlers never see the difference — the shapes are identical.

## Database

Drizzle schema: [`src/lib/db/schema.ts`](src/lib/db/schema.ts). Localized text is
stored as JSONB `{ ru, en, ab }`.

```bash
npm run db:migrate    # create the tables and the RLS policies
npm run db:seed       # import data/content.json into them
npm run db:health     # what is this deployment actually serving?
```

Full runbook, including what to put in Vercel: **[SUPABASE.md](SUPABASE.md)**.

Use the Supabase **transaction pooler** URL (port 6543) — the direct 5432
connection exhausts under Vercel's function concurrency.

## Deploying the showcase build to Vercel

The site deploys as-is. Two things need saying because the platform is
different from the laptop:

**The filesystem is read-only.** Pages are fine — they're statically generated,
so `data/content.json` is baked into the HTML at build time. The API routes
read the file at *runtime*, which Next's tracer can't see through a
`process.cwd()` path, so `next.config.ts` names it explicitly in
`outputFileTracingIncludes`. Without that the deployed API routes 500.

**Booking requests can't be stored.** A write is detected as impossible,
degraded to memory, and the whole request is written to the function log
prefixed `[booking-request] NOT PERSISTED`. It is recoverable from the Vercel
logs, but nobody is watching it — so set `NEXT_PUBLIC_DEMO=1`, which puts a
visible note on the booking form saying the request goes nowhere. **Don't
share the link as a working booking site until Supabase is wired.**

### Steps

```bash
npm i -g vercel     # once
vercel              # from this directory; accept the detected Next.js preset
vercel --prod
```

Environment variables to set in Vercel (Project → Settings → Environment
Variables):

| name | value | why |
|---|---|---|
| `NEXT_PUBLIC_DEMO` | `1` | shows the "this is a demo" note on the booking form |
| `NEXT_PUBLIC_SITE_URL` | your Vercel URL | absolute URLs in metadata |

Leave `DATA_SOURCE` unset — the default reads `data/content.json`, which is
committed, so **content edits you make locally ship on the next deploy**.

`data/content.json` must be committed. `/api/dev-seed` refuses to run in
production, so the file cannot be created on the server.

### Verified against a real production build

`next build` + `next start` with the deploy env set: all 104 pages 200, the
custom 404 fires, the API routes read the traced content file (3 properties, 8
rentals, 4 excursions), `/api/dev-seed` correctly 404s, a booking POST returns
201 and lands in the log, and the demo notice renders.

## The content file

`data/content.json` is created by `POST /api/dev-seed` (dev only), which copies
the fixtures into it. `?force=1` resets it; without that it refuses to
overwrite existing content, because that endpoint would happily destroy an
owner's edits.

It is still the **editing** format even with the database wired: it is
reviewable in a diff, the owner console writes it, and `npm run db:seed`
imports it into Postgres. What changed is that it is no longer what the live
site reads from once `DATABASE_URL` is set.

The console pings `POST /api/revalidate` after every write so cached pages pick
the change up.

## Admin API

Four endpoints behind a bearer token (`ADMIN_API_SECRET`), compared in
constant time and **failing closed** when the variable is unset — an
unconfigured deploy refuses them rather than publishing the booking inbox.

| endpoint | what it does |
|---|---|
| `GET /api/admin/health` | configured? reachable? migrated? seeded? — four failures that look the same from a browser |
| `POST /api/admin/seed` | import `data/content.json` into Postgres |
| `GET /api/admin/booking-requests` | the owner's inbox, `no-store` |
| `PATCH /api/admin/booking-requests/[id]` | confirm / decline / cancel |

## Error handling

Five layers, each catching what the one below it cannot:

| Layer | Where | What it does |
|---|---|---|
| 1. Route | `[locale]/not-found.tsx` | A real 404 page with a way back. Also what `notFound()` renders for an unknown slug. |
| 2. Render | `[locale]/error.tsx` | Segment error boundary with a **retry** — most failures here are a timed-out read that succeeds on the second attempt. |
| 3. Root | `global-error.tsx` | Replaces the document if the root layout itself fails. No fonts, no providers, no i18n — bilingual hard-coded text, because if next-intl is what broke, `useTranslations` would throw again. |
| 4. Data | `lib/data/index.ts` | `resilientFetch` (8s `AbortController` timeout, one retry on 5xx, **no retry on writes** — a duplicate booking is worse than an error). `optional()` degrades supporting reads. |
| 5. API | `lib/api.ts` | One response envelope for every endpoint, `route()` wrapper turning any throw into a logged+referenced 500, zod validation, and a fixed-window rate limit on the write path. |

Plus `[locale]/loading.tsx` skeletons while server reads resolve.

**Failure policy:** a read the page *is about* may throw, so layer 2 can offer a
retry — rendering a 404 for a database blip would be a lie. A supporting read
(reviews, cross-sell) is wrapped in `optional()` and degrades to empty.

API failures return `{ error, message, reference }`. The `reference` also
appears in the server log, which is what makes a support conversation
tractable. Internal messages are logged, never returned.

## Typography

| Role | Face | Why |
|---|---|---|
| Display | **Lora** | Warm editorial serif with a real italic for the wordmark |
| Body | **Manrope** | Clean, good Cyrillic texture |
| Labels | **JetBrains Mono** | The typewriter caps from the original mockup |

All three load `latin` + `cyrillic` + **`cyrillic-ext`**, and that last subset is
not optional. Abkhaz is written with extended Cyrillic — Ҧ Ҭ Ӡ Ҷ Ә Ҩ Ҕ Ҳ Ҵ Ҽ Ҿ,
all in `U+0460–052F`. Playfair Display was the original display face and ships
**only `U+0400–045F`**, so every Abkhaz letter silently fell back to whatever
the device had and `/ab` rendered in a mix of two typefaces. Check any
replacement against that block before swapping it in.

## Translations

- UI strings: `src/messages/{ru,en,ab}.json`
- Content strings: the `L(ru, en, ab?)` helper in `fixtures.ts`

Russian is the source language. `src/i18n/request.ts` deep-merges each locale
over `ru.json`, so **a key missing from `en` or `ab` renders the Russian string
rather than throwing** — adding a key to `ru.json` can never break another
locale.

That safety has a cost: an untranslated string is invisible until somebody
reads the page. It is how `Аренда авто` shipped as the heading of the English
`/cars` page. So:

```bash
npm run i18n:check          # list gaps
node scripts/i18n-check.js --strict   # exit 1 if any (for CI)
```

It reports keys missing from a locale, keys byte-identical to the Russian
(usually a copy-paste placeholder), and dead keys no longer in the source.
**Run it after adding any message key.** `ab` legitimately reports ~200
identical keys — Abkhaz is untranslated by design and falls back on purpose.

`ab.json` and every `L()` call without a third argument are still the Russian
text. They need an Abkhaz translator; the routing already serves them at `/ab`.

## Placeholder images

Fixture photos point at `picsum.photos` and are deliberately random — swap in
real photography (Supabase Storage) before launch.
