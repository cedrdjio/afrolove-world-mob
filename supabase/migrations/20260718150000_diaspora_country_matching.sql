-- ============================================================================
-- Rencontres diaspora : l'algorithme de découverte devient « par pays »
-- ============================================================================
-- Objectif produit : AfriLove World veut faire se rencontrer les gens de la
-- diaspora — des personnes vivant dans des PAYS DIFFÉRENTS — et non les gens
-- d'une même communauté locale. L'ancien algorithme triait par distance
-- géographique (le plus proche d'abord), soit exactement l'inverse.
--
-- Nouveau modèle — paramètre p_scope :
--   · 'international' (défaut de l'app) : uniquement des profils vivant dans
--     un autre pays que le vôtre, les plus actifs d'abord.
--   · 'country'  : uniquement les profils d'un pays précis (p_country).
--   · 'all'      : aucun filtre de pays (les autres pays restent priorisés
--     dans le tri). C'est aussi le défaut SQL, pour que les anciens builds
--     de l'app (qui n'envoient pas p_scope) continuent de fonctionner.
--
-- Le tri par distance disparaît ; p_max_distance_km reste accepté pour
-- compatibilité mais l'app ne l'envoie plus.
--
-- Ajout de get_discovery_countries() : liste des pays réellement représentés
-- (avec compteur de membres) pour alimenter le choix « pays précis » des
-- filtres sans liste codée en dur.
-- ============================================================================

-- Signature élargie → on supprime les anciennes surcharges pour éviter toute
-- ambiguïté de résolution PostgREST entre les deux versions.
drop function if exists public.search_profiles(
  integer, integer, integer, boolean, boolean, boolean, integer, integer, text, uuid[]
);
drop function if exists public.count_search_profiles(integer, integer, integer, boolean, uuid[]);

create function public.search_profiles(
  p_age_min integer default 18,
  p_age_max integer default 99,
  p_max_distance_km integer default null,
  p_verified_only boolean default false,
  p_new_only boolean default false,
  p_online_recently boolean default false,
  p_limit integer default 25,
  p_offset integer default 0,
  p_query text default null,
  p_interest_ids uuid[] default null,
  p_scope text default 'all',
  p_country text default null
)
returns table(
  id uuid, first_name text, age integer, gender text, city text, country text,
  bio text, is_verified boolean, avatar_url text, distance_km numeric,
  compatibility integer, interest_names text[],
  last_active_at timestamptz, created_at timestamptz
)
language sql stable security definer
set search_path to 'public', 'extensions'
set jit to 'off'
as $$
  with viewer as (
    select p.id, p.gender, p.looking_for, p.location, p.country,
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
    -- Diaspora : un autre pays que le mien (les profils sans pays renseigné
    -- restent visibles — on ne peut pas affirmer qu'ils sont locaux).
    and (
      p_scope is distinct from 'international'
      or v.country is null
      or p.country is distinct from v.country
    )
    and (
      p_scope is distinct from 'country'
      or p_country is null
      or p.country = p_country
    )
    and (
      p_max_distance_km is null
      or v.location is null
      or p.location is null
      or st_dwithin(p.location, v.location, p_max_distance_km * 1000)
    )
    and (
      p_interest_ids is null
      or exists (
        select 1 from public.profile_interests pi
        where pi.profile_id = p.id and pi.interest_id = any (p_interest_ids)
      )
    )
    and (
      p_query is null
      or p.first_name ilike '%' || p_query || '%'
      or p.city ilike '%' || p_query || '%'
      or p.country ilike '%' || p_query || '%'
    )
    and (
      p_query is not null
      or not exists (
        select 1 from public.swipes s
        where s.swiper_id = v.id and s.target_id = p.id
      )
    )
  order by
    (v.country is not null and p.country is not null and p.country <> v.country) desc,
    p.last_active_at desc nulls last
  limit p_limit offset p_offset
$$;

create function public.count_search_profiles(
  p_age_min integer default 18,
  p_age_max integer default 99,
  p_max_distance_km integer default null,
  p_verified_only boolean default false,
  p_interest_ids uuid[] default null,
  p_scope text default 'all',
  p_country text default null
)
returns integer
language sql stable security definer
set search_path to 'public', 'extensions'
set jit to 'off'
as $$
  with viewer as (
    select p.id, p.gender, p.looking_for, p.location, p.country
    from public.profiles p
    where p.id = auth.uid()
  )
  select count(*)::int
  from public.profiles p, viewer v
  where p.id <> v.id
    and p.profile_completed
    and p.birth_date is not null
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
    and (
      p_scope is distinct from 'international'
      or v.country is null
      or p.country is distinct from v.country
    )
    and (
      p_scope is distinct from 'country'
      or p_country is null
      or p.country = p_country
    )
    and (
      p_max_distance_km is null
      or v.location is null
      or p.location is null
      or st_dwithin(p.location, v.location, p_max_distance_km * 1000)
    )
    and (
      p_interest_ids is null
      or exists (
        select 1 from public.profile_interests pi
        where pi.profile_id = p.id and pi.interest_id = any (p_interest_ids)
      )
    )
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = v.id and s.target_id = p.id
    )
$$;

-- Pays réellement représentés dans l'app, pour le sélecteur « pays précis ».
create or replace function public.get_discovery_countries()
returns table(country text, member_count integer)
language sql stable security definer
set search_path to 'public', 'extensions'
as $$
  select p.country, count(*)::int as member_count
  from public.profiles p
  where p.profile_completed
    and p.country is not null
    and p.id is distinct from auth.uid()
  group by p.country
  order by count(*) desc, p.country asc
$$;
