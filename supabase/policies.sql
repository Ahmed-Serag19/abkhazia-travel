-- Row Level Security for Casa Colina.
--
-- WHY THIS FILE EXISTS
--
-- The app talks to Postgres over the connection string as the `postgres`
-- role, which bypasses RLS entirely. So none of this affects the site.
--
-- It matters because Supabase *also* exposes every table in `public` over
-- HTTP through PostgREST, reachable with the project's anon key. The anon key
-- is designed to be public. With RLS off, "public" and "readable by anyone
-- who has ever seen the key" are the same sentence — and `booking_requests`
-- holds guests' names, emails and phone numbers.
--
-- So: RLS on everywhere. Catalogue tables get a public read policy, because
-- that content is on the website anyway. `booking_requests` gets no policy at
-- all, which under RLS means **nobody reaches it** except roles that bypass
-- RLS — the app's own connection and the service_role key.
--
-- Idempotent: safe to run again after a schema change.

alter table "hosts"            enable row level security;
alter table "properties"       enable row level security;
alter table "units"            enable row level security;
alter table "rooms"            enable row level security;
alter table "sellers"          enable row level security;
alter table "provisions"       enable row level security;
alter table "rentals"          enable row level security;
alter table "excursions"       enable row level security;
alter table "reviews"          enable row level security;
alter table "booking_requests" enable row level security;

-- Catalogue: world-readable, never world-writable.
do $$
declare
  t text;
begin
  foreach t in array array[
    'hosts','properties','units','rooms','sellers',
    'provisions','rentals','excursions','reviews'
  ]
  loop
    execute format('drop policy if exists %I on %I', t || '_public_read', t);
    execute format(
      'create policy %I on %I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );
  end loop;
end $$;

-- Reviews: only published ones are public. Replace the blanket policy above
-- for this one table, so an unapproved review is not readable before the
-- owner has seen it.
drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews
  for select to anon, authenticated
  using (published = true);

-- booking_requests: no policy, on purpose. With RLS enabled and no policy,
-- anon and authenticated get zero rows and zero writes. Inserts still work
-- from the app because the app is not using PostgREST.
--
-- If the booking form is ever moved to the browser with the anon key, add a
-- narrow insert-only policy here and nothing else:
--
--   create policy booking_insert on booking_requests
--     for insert to anon with check (true);
--
-- Note: `for insert` grants no select, so a guest could not read back other
-- people's requests. Do not add a select policy to this table.

-- A quick self-check. Anything listed here is still exposed.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  count(p.polname) as policies
from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;
