-- Instant global search for the admin dashboard (Sprint A0).
-- SECURITY DEFINER because profiles are owner-readable only; gated on
-- is_admin() and never executable by anon.
create or replace function public.admin_search_profiles(p_query text, p_limit int default 8)
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  city text,
  country text,
  avatar_url text,
  account_status text,
  is_verified boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select p.id, p.first_name, p.last_name, p.email, p.city, p.country,
         p.avatar_url, p.account_status, p.is_verified
  from public.profiles p
  where p.first_name ilike '%' || p_query || '%'
     or p.last_name ilike '%' || p_query || '%'
     or p.email ilike '%' || p_query || '%'
     or p.city ilike '%' || p_query || '%'
  order by p.last_active_at desc
  limit least(greatest(p_limit, 1), 25);
end;
$$;

revoke execute on function public.admin_search_profiles(text, int) from public, anon;
grant execute on function public.admin_search_profiles(text, int) to authenticated;
