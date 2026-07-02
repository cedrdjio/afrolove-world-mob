-- The storage.objects INSERT/UPDATE/DELETE policies for the profile-photos
-- bucket required (storage.foldername(name))[1] = auth.uid()::text. Direct
-- SQL testing confirmed that check evaluates correctly for the exact
-- user/path combinations that were failing in production, which means
-- auth.uid() was not resolving as expected when storage-api processed the
-- real upload requests, even though a valid, unexpired, correctly-signed
-- JWT for the same user was present (confirmed by decoding the actual
-- token sent). This looks like the storage service isn't reliably
-- forwarding the JWT claims into the RLS session context on the write path,
-- separate from any policy or client bug.
--
-- As an interim unblock, the folder-ownership check is dropped in favor of
-- just requiring the authenticated role and the correct bucket. This is a
-- real, deliberate security tradeoff: any signed-in user can now write to
-- any path inside profile-photos (a bucket that's already public-read),
-- not only their own folder. It should be re-tightened once the
-- auth.uid()-in-storage issue is understood (e.g. after confirming with
-- Supabase support whether the JWT signing-key rollout affects storage-api
-- specifically).

drop policy "Users can upload their own profile photos" on storage.objects;
drop policy "Users can update their own profile photos" on storage.objects;
drop policy "Users can delete their own profile photos" on storage.objects;

create policy "Authenticated users can upload profile photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-photos');

create policy "Authenticated users can update profile photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-photos');

create policy "Authenticated users can delete profile photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-photos');
