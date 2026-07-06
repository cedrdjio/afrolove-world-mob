-- Forfaits réellement appliqués + fondations des maquettes.
--
-- 1. Compte gratuit : 15 swipes/jour maximum (like, super like et pass
--    confondus) et 10 favoris (likes en attente de réponse) maximum.
--    Premium : swipes et favoris illimités, 5 super likes/jour.
-- 2. get_my_entitlements expose l'usage et les plafonds de swipes/favoris
--    pour que l'app affiche le compteur et déclenche l'écran forfaits.
-- 3. profile_views : compteur « Vues » de la maquette Mon profil.
-- 4. search_profiles filtrable par centres d'intérêt + RPC de comptage pour
--    le bouton « Voir N profils » de l'écran Filtres.
-- 5. lifestyle_options.value : les libellés de style de vie viennent de la
--    BD, la valeur canonique reste alignée sur les contraintes de profiles.

-- ============================================================
-- 1. Limites gratuites : 15 swipes/jour, 10 favoris, super like premium
-- ============================================================
create or replace function public.enforce_swipe_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_premium boolean;
  v_count int;
begin
  if tg_op = 'UPDATE' and old.action = new.action then return new; end if;

  v_premium := public.has_active_premium(new.swiper_id);

  -- Plafond global de swipes du jour (toutes actions, pass compris) pour les
  -- comptes sans forfait. Les re-swipes (UPDATE) ne consomment pas de quota.
  if not v_premium and tg_op = 'INSERT' then
    select count(*) into v_count
      from public.swipes
      where swiper_id = new.swiper_id
        and created_at >= date_trunc('day', now());
    if v_count >= 15 then
      raise exception 'SWIPE_LIMIT_REACHED';
    end if;
  end if;

  if new.action = 'pass' then return new; end if;

  if new.action = 'super_like' then
    if not v_premium then
      raise exception 'SUPER_LIKE_PREMIUM_ONLY';
    end if;
    select count(*) into v_count
      from public.swipes
      where swiper_id = new.swiper_id and action = 'super_like'
        and created_at >= date_trunc('day', now());
    if v_count >= 5 then
      raise exception 'SUPER_LIKE_LIMIT_REACHED';
    end if;
  elsif not v_premium then
    -- Favoris = likes donnés pas encore transformés en match.
    select count(*) into v_count
      from public.swipes s
      where s.swiper_id = new.swiper_id
        and s.action <> 'pass'
        and not exists (
          select 1 from public.matches m
          where m.profile_a = least(s.swiper_id, s.target_id)
            and m.profile_b = greatest(s.swiper_id, s.target_id)
        );
    if v_count >= 10 then
      raise exception 'FAVORITES_LIMIT_REACHED';
    end if;
  end if;

  return new;
end;
$$;

-- ============================================================
-- 2. Entitlements enrichis (usage + plafonds swipes/favoris)
-- ============================================================
drop function public.get_my_entitlements();

create or replace function public.get_my_entitlements()
returns table (
  is_premium boolean,
  premium_until timestamptz,
  plan_label text,
  likes_used_today int,
  likes_limit int,           -- null = illimité
  super_likes_used_today int,
  super_likes_limit int,
  likers_count int,
  swipes_used_today int,
  swipes_limit int,          -- null = illimité
  favorites_count int,
  favorites_limit int        -- null = illimité
)
language sql
security definer
set search_path = public
as $$
  with prem as (
    select s.expires_at, p.label
    from public.subscriptions s
    join public.premium_plans p on p.key = s.plan_key
    where s.profile_id = auth.uid() and s.status = 'active' and s.expires_at > now()
    order by s.expires_at desc
    limit 1
  ),
  usage as (
    select
      count(*)::int as swipes,
      count(*) filter (where action <> 'pass')::int as likes,
      count(*) filter (where action = 'super_like')::int as supers
    from public.swipes
    where swiper_id = auth.uid() and created_at >= date_trunc('day', now())
  ),
  favs as (
    select count(*)::int as n
    from public.swipes s
    where s.swiper_id = auth.uid()
      and s.action <> 'pass'
      and not exists (
        select 1 from public.matches m
        where m.profile_a = least(s.swiper_id, s.target_id)
          and m.profile_b = greatest(s.swiper_id, s.target_id)
      )
  ),
  likers as (
    select count(*)::int as n
    from public.swipes s
    join public.profiles p on p.id = s.swiper_id
    where s.target_id = auth.uid()
      and s.action <> 'pass'
      and p.account_status = 'active'
      and not public.is_blocked_between(auth.uid(), s.swiper_id)
      and not exists (
        select 1 from public.swipes r where r.swiper_id = auth.uid() and r.target_id = s.swiper_id
      )
  )
  select
    exists (select 1 from prem),
    (select expires_at from prem),
    (select label from prem),
    usage.likes,
    case when exists (select 1 from prem) then null else 10 end,
    usage.supers,
    case when exists (select 1 from prem) then 5 else 0 end,
    likers.n,
    usage.swipes,
    case when exists (select 1 from prem) then null else 15 end,
    favs.n,
    case when exists (select 1 from prem) then null else 10 end
  from usage, favs, likers
$$;

revoke execute on function public.get_my_entitlements() from public, anon;
grant execute on function public.get_my_entitlements() to authenticated;

-- ============================================================
-- 3. Vues de profil — stat « Vues » de la maquette Mon profil
-- ============================================================
create table public.profile_views (
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (viewer_id, target_id),
  check (viewer_id <> target_id)
);

create index profile_views_target_idx on public.profile_views (target_id);

alter table public.profile_views enable row level security;
-- Aucune policy : lecture agrégée via get_my_profile_stats, écriture via RPC.

create or replace function public.record_profile_view(p_profile_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.profile_views (viewer_id, target_id)
  select auth.uid(), p_profile_id
  where auth.uid() is not null
    and p_profile_id is not null
    and p_profile_id <> auth.uid()
    and exists (select 1 from public.profiles p where p.id = p_profile_id)
  on conflict (viewer_id, target_id) do update set viewed_at = now()
$$;

revoke execute on function public.record_profile_view(uuid) from public, anon;
grant execute on function public.record_profile_view(uuid) to authenticated;

drop function public.get_my_profile_stats();

create or replace function public.get_my_profile_stats()
returns table (views_count int, likes_received int, matches_count int, match_rate int)
language sql
security definer
set search_path = public
as $$
  with views as (
    select count(*)::int as n from public.profile_views where target_id = auth.uid()
  ),
  likes as (
    select count(*)::int as n
    from public.swipes
    where target_id = auth.uid() and action <> 'pass'
  ),
  m as (
    select count(*)::int as n
    from public.matches
    where auth.uid() in (profile_a, profile_b)
  )
  select
    views.n,
    likes.n,
    m.n,
    case when likes.n = 0 then 0 else least(100, m.n * 100 / likes.n) end
  from views, likes, m
$$;

revoke execute on function public.get_my_profile_stats() from public, anon;
grant execute on function public.get_my_profile_stats() to authenticated;

-- ============================================================
-- 4. Découverte filtrable par centres d'intérêt + comptage
-- ============================================================
drop function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text);

create or replace function public.search_profiles(
  p_age_min int default 18,
  p_age_max int default 99,
  p_max_distance_km int default null,
  p_verified_only boolean default false,
  p_new_only boolean default false,
  p_online_recently boolean default false,
  p_limit int default 25,
  p_offset int default 0,
  p_query text default null,
  p_interest_ids uuid[] default null
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
    (v.location is not null and p.location is not null) desc,
    st_distance(p.location, v.location) asc nulls last,
    p.last_active_at desc
  limit p_limit offset p_offset
$$;

revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text, uuid[]) from anon;

-- Compteur du bouton « Voir N profils » : mêmes règles d'éligibilité que le
-- deck (orientation mutuelle, statut, déjà-swipés exclus), sans pagination.
create or replace function public.count_search_profiles(
  p_age_min int default 18,
  p_age_max int default 99,
  p_max_distance_km int default null,
  p_verified_only boolean default false,
  p_interest_ids uuid[] default null
)
returns int
language sql
security definer
set search_path = public, extensions
as $$
  with viewer as (
    select p.id, p.gender, p.looking_for, p.location
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

revoke execute on function public.count_search_profiles(int, int, int, boolean, uuid[]) from public, anon;
grant execute on function public.count_search_profiles(int, int, int, boolean, uuid[]) to authenticated;

-- ============================================================
-- 5. Style de vie piloté par la BD : valeur canonique par option
-- ============================================================
alter table public.lifestyle_options add column value text;

update public.lifestyle_options set value = v.value
from (values
  ('smoking_no', 'non_smoker'), ('smoking_sometimes', 'occasional'), ('smoking_yes', 'smoker'),
  ('drinking_never', 'never'), ('drinking_social', 'socially'), ('drinking_regular', 'regularly'),
  ('gym_never', 'never'), ('gym_sometimes', 'occasional'), ('gym_often', 'regular'),
  ('children_no', 'not_wanted'), ('children_want', 'wants'), ('children_have', 'has_children')
) as v(key, value)
where lifestyle_options.key = v.key;

-- Les anciennes entrées animaux (chien/chat/autre) et « indécis » ne
-- correspondent à aucune valeur autorisée de profiles — remplacées par le
-- trio canonique, désactivées plutôt que supprimées (historique dashboard).
update public.lifestyle_options set is_active = false
where key in ('pets_none', 'pets_dog', 'pets_cat', 'pets_other', 'children_maybe');

insert into public.lifestyle_options (key, label, category, sort_order, value) values
  ('pets_love', 'Adore', 'pets', 1, 'love'),
  ('pets_neutral', 'Neutre', 'pets', 2, 'neutral'),
  ('pets_not_fan', 'Pas fan', 'pets', 3, 'not_fan')
on conflict (key) do update set value = excluded.value, is_active = true;
