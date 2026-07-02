-- The profile detail view renders lifestyle, religion, education, interests
-- and languages — enrich get_public_profile with those (ids resolve against
-- the public reference catalogs client-side). Still no email, no exact
-- coordinates, no birth date (age only), and only active+completed profiles.
drop function public.get_public_profile(uuid);

create or replace function public.get_public_profile(p_profile_id uuid)
returns table (
  id uuid,
  first_name text,
  age int,
  gender text,
  city text,
  country text,
  bio text,
  profession text,
  height_cm smallint,
  is_verified boolean,
  avatar_url text,
  distance_km numeric,
  smoking text,
  drinking text,
  gym_habit text,
  has_pets text,
  wants_children text,
  religion_id uuid,
  education_level_id uuid,
  interest_ids uuid[],
  language_ids uuid[],
  photo_urls text[],
  last_active_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    p.id,
    p.first_name,
    date_part('year', age(p.birth_date))::int as age,
    p.gender,
    p.city,
    p.country,
    p.bio,
    p.profession,
    p.height_cm,
    p.is_verified,
    p.avatar_url,
    case
      when v.location is not null and p.location is not null
        then round((st_distance(p.location, v.location) / 1000)::numeric, 1)
    end as distance_km,
    p.smoking,
    p.drinking,
    p.gym_habit,
    p.has_pets,
    p.wants_children,
    p.religion_id,
    p.education_level_id,
    coalesce(
      (select array_agg(pi.interest_id) from public.profile_interests pi where pi.profile_id = p.id),
      '{}'
    ) as interest_ids,
    coalesce(
      (select array_agg(pl.language_id) from public.profile_languages pl where pl.profile_id = p.id),
      '{}'
    ) as language_ids,
    coalesce(
      (select array_agg(ph.url order by ph.is_primary desc, ph.position)
       from public.profile_photos ph
       where ph.profile_id = p.id),
      '{}'
    ) as photo_urls,
    p.last_active_at
  from public.profiles p
  left join public.profiles v on v.id = auth.uid()
  where p.id = p_profile_id
    and p.profile_completed
    and p.account_status = 'active'
$$;

revoke execute on function public.get_public_profile(uuid) from public, anon;
grant execute on function public.get_public_profile(uuid) to authenticated;
