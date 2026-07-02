-- Postgres grants EXECUTE to PUBLIC on new functions by default, so the
-- earlier `revoke ... from anon` calls were ineffective (anon kept access
-- through the PUBLIC grant). Revoke from PUBLIC and grant back explicitly.

-- Member-facing RPCs: signed-in users only.
revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text) from public, anon;
grant execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text) to authenticated;

revoke execute on function public.get_public_profile(uuid) from public, anon;
grant execute on function public.get_public_profile(uuid) to authenticated;

revoke execute on function public.get_my_profile_stats() from public, anon;
grant execute on function public.get_my_profile_stats() to authenticated;

-- Trigger functions: never callable directly by API roles; they run through
-- their triggers with the table owner's privileges.
revoke execute on function public.sync_match_on_swipe() from public, anon, authenticated;
revoke execute on function public.sync_kyc_verification() from public, anon, authenticated;
revoke execute on function public.recompute_profile_completed() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_updated_at() from public, anon, authenticated;
revoke execute on function public.enforce_photo_limit() from public, anon, authenticated;
revoke execute on function public.enforce_single_primary_photo() from public, anon, authenticated;
revoke execute on function public.sync_profile_avatar() from public, anon, authenticated;
