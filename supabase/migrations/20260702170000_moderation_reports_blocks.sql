-- Sprint 1 — real moderation. Store-mandated for a dating app: working
-- reports, effective blocks (blocked members vanish from discovery, search,
-- conversations, public profiles, and can't be messaged). Reports are
-- write-only for members; reading/reviewing is the admin dashboard's job.

-- ============================================================
-- 1. Reports
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint reports_no_self check (reporter_id <> reported_id)
);

create index reports_open_idx on public.reports (status, created_at desc);
create index reports_reported_idx on public.reports (reported_id);

alter table public.reports enable row level security;

-- Members can only file reports about others; they never read the queue.
create policy "Members file reports"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

-- ============================================================
-- 2. Blocks
-- ============================================================
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self check (blocker_id <> blocked_id)
);

create index blocks_blocked_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

create policy "Members manage their own blocks"
  on public.blocks for all to authenticated
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- Blocked list with display info (profiles RLS is owner-only, so definer).
create or replace function public.get_my_blocked_profiles()
returns table (
  blocked_id uuid,
  first_name text,
  avatar_url text,
  blocked_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select b.blocked_id, p.first_name, p.avatar_url, b.created_at
  from public.blocks b
  join public.profiles p on p.id = b.blocked_id
  where b.blocker_id = auth.uid()
  order by b.created_at desc
$$;

revoke execute on function public.get_my_blocked_profiles() from public, anon;
grant execute on function public.get_my_blocked_profiles() to authenticated;

-- Convenience predicate reused by every surface below.
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  )
$$;

revoke execute on function public.is_blocked_between(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;

-- ============================================================
-- 3. Blocks disappear people everywhere
-- ============================================================

-- Discovery / search
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
    and p.account_status = 'active'
    and p.birth_date is not null
    and not public.is_blocked_between(v.id, p.id)
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

revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text) from public, anon;
grant execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text) to authenticated;

-- Public profile view
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
    and not public.is_blocked_between(auth.uid(), p.id)
$$;

revoke execute on function public.get_public_profile(uuid) from public, anon;
grant execute on function public.get_public_profile(uuid) to authenticated;

-- Conversation list
create or replace function public.get_my_conversations()
returns table (
  match_id uuid,
  matched_at timestamptz,
  partner_id uuid,
  partner_first_name text,
  partner_avatar_url text,
  partner_is_verified boolean,
  partner_last_active_at timestamptz,
  last_message text,
  last_message_at timestamptz,
  last_message_sender_id uuid,
  unread_count int
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.created_at,
    p.id,
    p.first_name,
    p.avatar_url,
    p.is_verified,
    p.last_active_at,
    lm.content,
    lm.created_at,
    lm.sender_id,
    coalesce(u.n, 0)
  from public.matches m
  join public.profiles p
    on p.id = case when m.profile_a = auth.uid() then m.profile_b else m.profile_a end
  left join lateral (
    select content, created_at, sender_id
    from public.messages
    where match_id = m.id
    order by created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*)::int as n
    from public.messages
    where match_id = m.id and read_at is null and sender_id <> auth.uid()
  ) u on true
  where auth.uid() in (m.profile_a, m.profile_b)
    and p.account_status = 'active'
    and not public.is_blocked_between(auth.uid(), p.id)
  order by coalesce(lm.created_at, m.created_at) desc
$$;

revoke execute on function public.get_my_conversations() from public, anon;
grant execute on function public.get_my_conversations() to authenticated;

-- Message sending between blocked members is refused at the RLS level.
drop policy "Members send in their conversations" on public.messages;
create policy "Members send in their conversations"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and auth.uid() in (m.profile_a, m.profile_b)
        and not public.is_blocked_between(m.profile_a, m.profile_b)
    )
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.account_status = 'active'
    )
  );
