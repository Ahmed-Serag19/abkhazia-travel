-- Photo storage for listings, uploaded from the owner console.
--
-- Applied by `npm run db:migrate`, after policies.sql. Idempotent: safe to
-- run again.
--
-- WHO CAN WRITE
--
-- Only accounts carrying `app_metadata.role = 'console_admin'`. Not "any
-- signed-in user": this project's sign-ups are open (Supabase's default), and
-- the publishable key is public by design, so anyone can create an account
-- through the Auth API. The only thing stopping them signing in today is that
-- new accounts must confirm an email Supabase's built-in mailer will not
-- deliver to strangers. That is an accident, not a lock — it disappears the
-- day a real mail service is configured.
--
-- app_metadata is the right place for the role because users cannot write
-- it: `supabase.auth.updateUser()` edits user_metadata only. Only the server
-- (SQL, or the secret key) can grant it. See the console's
-- scripts/grant-console-admin.mjs.
--
-- The console's sign-in guard (abkhazia-admin/src/proxy.ts) checks the same
-- role, so there is one definition of "admin" for both pages and uploads.
--
-- WHO CAN READ
--
-- Everyone. The bucket is public because the guest site has to show the
-- images; public objects are served from /storage/v1/object/public/… without
-- any policy. There is deliberately no SELECT policy, so the bucket cannot be
-- *listed* through the API — you can fetch a photo whose name you know, not
-- browse them all.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880,                                   -- 5 MB; the console resizes first
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists photos_admin_insert on storage.objects;
create policy photos_admin_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'console_admin'
  );

drop policy if exists photos_admin_update on storage.objects;
create policy photos_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'photos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'console_admin'
  )
  with check (
    bucket_id = 'photos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'console_admin'
  );

drop policy if exists photos_admin_delete on storage.objects;
create policy photos_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'console_admin'
  );
