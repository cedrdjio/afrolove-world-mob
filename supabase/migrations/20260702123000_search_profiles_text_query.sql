-- Adds free-text search (first name / city / country) to search_profiles so
-- the search screen runs on the same RPC as the discovery deck. The old
-- signature must be dropped first — otherwise PostgREST sees two overloads.
drop function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int);

create or replace function public.search_profiles(
  p_age_min int default 18,
  p_age_max int default 99,
  p_max_distance_km int default null,
  p_verified_only boolean default false,
  p_new_only boolean default false,
  p_online_recently boolean default false,
  p_limit int default 25,
  p_offset int default 0,
  p_query text default null
)
returns table (
  id uuid,
  first_name text,
  age int,
  gender text,
  city text,
  country text,
  bio text,
  is_verified boolean,
  avatar_url text,
  distance_km numeric,
  compatibility int,
  interest_names text[],
  last_active_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  with viewer as (
    select p.id, p.gender, p.looking_for, p.location,
      (select count(*) from public.profile_interests pi where pi.profile_id = p.id) as interest_count
    from public.profiles p
    where p.id = auth.uid()
  )
  select
    p.id,
    p.first_name,
    date_part('year', age(p.birth_date))::int as age,
    p.gender,
    p.city,
    p.country,
    p.bio,
    p.is_verified,
    p.avatar_url,
    case
      when v.location is not null and p.location is not null
        then round((st_distance(p.location, v.location) / 1000)::numeric, 1)
    end as distance_km,
    least(99, greatest(50, 50 + (
      select count(*)::int * 49 / greatest(v.interest_count, 1)
      from public.profile_interests a
      join public.profile_interests b on b.interest_id = a.interest_id and b.profile_id = v.id
      where a.profile_id = p.id
    )))::int as compatibility,
    coalesce(
      (select array_agg(i.label order by i.label)
       from public.profile_interests pi
       join public.interests i on i.id = pi.interest_id
       where pi.profile_id = p.id),
      '{}'
    ) as interest_names,
    p.last_active_at,
    p.created_at
  from public.profiles p, viewer v
  where p.id <> v.id
    and p.profile_completed
    and p.birth_date is not null
    -- Mutual orientation: they match what I look for, and I match theirs.
    and (
      v.looking_for = 'les-deux'
      or (v.looking_for = 'femmes' and p.gender = 'femme')
      or (v.looking_for = 'hommes' and p.gender = 'homme')
    )
    and (
      p.looking_for = 'les-deux'
      or (p.looking_for = 'femmes' and v.gender = 'femme')
      or (p.looking_for = 'hommes' and v.gender = 'homme')
    )
    and date_part('year', age(p.birth_date)) between p_age_min and p_age_max
    and (not p_verified_only or p.is_verified)
    and (not p_new_only or p.created_at > now() - interval '14 days')
    and (not p_online_recently or p.last_active_at > now() - interval '1 hour')
    and (
      p_max_distance_km is null
      or v.location is null
      or p.location is null
      or st_dwithin(p.location, v.location, p_max_distance_km * 1000)
    )
    and (
      p_query is null
      or p.first_name ilike '%' || p_query || '%'
      or p.city ilike '%' || p_query || '%'
      or p.country ilike '%' || p_query || '%'
    )
    -- The deck hides everyone already swiped; an explicit text search
    -- deliberately searches the whole pool again.
    and (
      p_query is not null
      or not exists (
        select 1 from public.swipes s
        where s.swiper_id = v.id and s.target_id = p.id
      )
    )
  order by
    (v.location is not null and p.location is not null) desc,
    st_distance(p.location, v.location) asc nulls last,
    p.last_active_at desc
  limit p_limit offset p_offset
$$;

revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text) from anon;
