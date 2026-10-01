# Casa Colina guest site: handoff

Updated 2026-10-01 for whoever picks this up next, human or Claude.
The owner console has its own handoff: `../abkhazia-admin/HANDOFF.md`. Read
both; the two apps share one database and some code.

**The go-live checklist for both sites is in section 1.** It is the answer to
"what is left before real customers can use this".

---

## 1. Go-live checklist: real data, no dummy

The code is done enough to run on real data. **The data is not.** Everything
currently in the database except the booking table is sample content written
during development. The site also makes promises and shows contact details
that nobody has confirmed.

### A. Blockers — do not share the site with customers until these are done

1. **Delete the 12 invented reviews.** They are written as if by real guests
   (Ирина, Martin, Sofia…). The 4 on excursions are rendered on the excursion
   pages. Publishing fabricated reviews as genuine is deceptive, and in most
   places it is illegal under consumer-protection law. The console has no
   reviews screen, so this needs a one-off delete in the database (or a small
   console screen; see 1.C.4). Ask Claude to do it; it is a destructive change
   to live data, so it should be confirmed first.
2. **Replace the sample catalogue with real listings.** All of these are
   invented: the host "Astan", 3 sellers (Ripa Family Dairy, Gagra Hills
   Apiary, Tsandripsh Garden), 9 products, 8 rentals, 4 excursions. Their
   prices, descriptions and itineraries are made up. Delete them in the console
   and enter the real ones. **Properties are already empty** and need adding:
   Ahmad Farm (whole houses) and Moaz Farm (rooms with a host) are real, but
   everything written about them earlier was not.
3. **Real photos have no way in.** The console takes photo *paths* into this
   repo's `public/` folder; it cannot upload. To show real photos of real
   houses today, someone has to put the files in `public/photos/`, commit and
   deploy, then type the paths into the console. That is not workable for an
   owner. Fix: Supabase Storage upload in the console (recommended before
   launch).
   The 17 photos currently used are real, licensed (CC-BY-SA) photos of
   Abkhazia from Wikimedia — fine for excursions to real places, wrong for
   houses. Keep `public/photos/CREDITS.md` if any stay.
4. **Real contact details.** The footer links to `hello@casacolina.example`
   and WhatsApp `wa.me/00000000000`. Both go nowhere.
   File: `src/components/site/Footer.tsx`.
5. **Someone must be told when a booking request arrives.** Requests are stored
   and appear in the console, but nobody is notified. With no notification, a
   guest waits and the owner never knows. Either add email or Telegram (hook:
   `TODO(notify)` in `src/app/api/booking-requests/route.ts`; `RESEND_API_KEY`
   and `TELEGRAM_*` are reserved in `.env.example`), or the owner checks the
   console every day.
6. **Confirm three promises the home page makes.** They are written in the
   owner's name and nobody has confirmed them:
   - the owner "usually replies within a couple of hours"
   - "there is no site commission — the price is the owner's price"
   - "we are a few families on the coast…"

   Text: `src/messages/{ru,en,ab}.json` under `home.how` and `home.stats.note`.
7. **A privacy notice.** The booking form collects names, emails and phone
   numbers, and there is no privacy policy page. Russia's personal-data law
   (152-FZ) and the EU's GDPR both expect one, and 152-FZ also expects consent
   to processing. This is not legal advice — get the wording checked — but the
   page and a consent line on the form are code work, and small.
8. **Vercel settings on this project.** With the database-only change
   (commit `6f1d324`), **a build without `DATABASE_URL` fails**. Set:
   `DATABASE_URL`, `ADMIN_API_SECRET`, `REVALIDATE_SECRET` (the same value as
   the console's), and `NEXT_PUBLIC_SITE_URL` (the real URL).
   `NEXT_PUBLIC_DEMO` is no longer used by the code, so it can be deleted.
9. **Rotate the leaked credentials.** The database password and the
   `sb_secret_…` key were pasted into a chat. Reset both in Supabase and update
   `.env.local` here and in the console, and both Vercel projects.

### B. Should do around launch

1. **A domain.** Both apps are on `*.vercel.app`. Buy one, point the site at
   it, put the console on a subdomain (`admin.…`), and update
   `NEXT_PUBLIC_SITE_URL` and the console's `GUEST_SITE_URL`.
2. **Abkhaz.** The language switcher offers Аҧсшәа, but 206 strings and all
   content are actually Russian under that label. Either get it translated by
   a person, or hide `ab` from the switcher until it is. Don't machine-translate
   it.
3. **Email the guest when a request is confirmed.** It belongs in the same
   transaction as the status change (console: `TODO(notify)` in
   `src/lib/store.ts`).
4. **Fix the rental with slug `f`.** That's the E-bike; it looks like an
   accidental edit in the console. Its page lives at `/rent/f`.

### C. After launch

1. A real rate limit on the booking form (currently in-memory, per instance).
2. Two-factor sign-in or an audit trail, if anyone besides the owner ever gets
   console access.
3. Deleting a property leaves its host and reviews behind. Reusing an old slug
   brings the old reviews back. Add cleanup or a cascade.
4. A reviews screen in the console, once there are real reviews to moderate.
   The table already has a `published` flag.

---

## 2. Current state (verified 2026-10-01, not assumed)

1. **Database-only** since commit `6f1d324`. Fixtures, `content.json`, the
   seed script and the seed routes are gone. There is no way for this site to
   fall back to sample content.
2. Data from Supabase Postgres via Drizzle (`src/lib/data/db-source.ts`).
   Typecheck, lint, translation check and a production build against the live
   database all pass (92 pages).
3. Pages are statically generated and revalidated every 5 minutes, or
   immediately when the console calls `POST /api/revalidate`.
4. Booking requests are written to `booking_requests`. A real POST was tested
   end to end: 201, then read back through the admin endpoint.
5. Functions run in London (`lhr1`), next to the database.
6. Error handling: five layers, a custom 404, and `/api/admin/health`. See
   `README.md`.
7. Locales: Russian (default, source), English, Abkhaz. Run
   `npm run i18n:check` after adding any key.

## 3. Where things are

1. Repo: https://github.com/Ahmed-Serag19/abkhazia-travel (branch `main`)
2. Local: `D:\programming\web\abkhazia-travel`, runs on port 3000
3. Supabase project `lkrckfyimnxpigpppfrz`, region **eu-west-2 (London)**,
   transaction pooler `aws-0-eu-west-2.pooler.supabase.com:6543`
4. Secrets live only in `.env.local` (gitignored) and Vercel; the template is
   `.env.example`. **Never paste them into a chat.**
5. Runbook: `SUPABASE.md`. Schema: `src/lib/db/schema.ts` → migration
   `drizzle/0000_initial.sql`; row security in `supabase/policies.sql`.
6. This repo owns the domain model. The console copies `types.ts`, `schema.ts`
   and `mappers.ts` from here with `npm run sync:core`. It does **not** copy
   `ids.ts` any more; the console owns that now.

## 4. Load-bearing — do not undo

1. **`max_pipeline: 0`** in `src/lib/db/client.ts`. postgres.js pipelines
   queries by default and Supabase's transaction pooler doesn't support it. A
   pipelined query either hangs forever or **returns another query's rows**.
   That happened here: an excursion came back holding a seller's record.
   `max: 1` is only safe with this on.
2. **`vercel.json` → `"regions": ["lhr1"]`.** Vercel defaults to Washington.
3. **Row level security on every table** (`supabase/policies.sql`).
   `booking_requests` deliberately has **no policy**, so nobody can read it
   through Supabase's public API; it holds guests' phone numbers.
4. **Fonts must include `cyrillic-ext` (U+0460–052F)** or Abkhaz letters break.
5. **Two irreducible Stay modes**: `compound` (whole houses, priced per
   night) and `hosted` (rooms priced per person, with a host).
6. **Request-to-book.** No card payments on the site, by design.

## 5. For the next Claude

1. Serga is a **frontend developer learning fullstack**. He can't catch
   backend mistakes, so verification is your job.
2. **Run database code against the real database before calling it done.**
3. For an infrastructure bug, **read the vendor docs before guessing.**
4. His terminal is **Windows PowerShell 5.1**: `&&` is a syntax error. Give him
   one command per line.
5. He wants **numbered lists with the open decisions first**. He wants you to
   own visual design.
6. The Supabase MCP server is registered in `~/.claude.json` but **needs
   authenticating** (`/mcp` in a terminal) before its tools work.

## 6. Commands

```bash
npm run dev            # http://localhost:3000
npm run build          # needs DATABASE_URL
npm run i18n:check     # report translation gaps (add --strict for CI)
npm run db:migrate     # create tables + row security (safe to re-run)
npm run db:health      # what is this deployment serving?
```
