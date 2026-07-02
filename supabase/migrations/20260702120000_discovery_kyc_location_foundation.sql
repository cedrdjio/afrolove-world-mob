-- Foundation for real discovery, KYC and proximity search. Everything a
-- future web admin dashboard needs lives in the database (tables, RLS,
-- triggers, RPCs) so both clients read the same source of truth.

-- ============================================================
-- 1. Location — PostGIS + generated geography column
-- ============================================================
create extension if not exists postgis with schema extensions;

alter table public.profiles
  add column is_verified boolean not null default false,
  add column last_active_at timestamptz not null default now(),
  add column location_updated_at timestamptz;

-- Derived from the lat/lng the app writes; clients never touch it directly,
-- and every proximity query goes through the GIST index below.
alter table public.profiles
  add column location extensions.geography(point, 4326)
  generated always as (
    case
      when latitude is not null and longitude is not null
        then extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
    end
  ) stored;

create index profiles_location_gix on public.profiles using gist (location);
create index profiles_discovery_idx on public.profiles (profile_completed, gender, birth_date);

-- ============================================================
-- 2. Swipes — one row per (swiper, target), the raw signal
-- ============================================================
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('like', 'pass', 'super_like')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint swipes_no_self check (swiper_id <> target_id),
  constraint swipes_unique_pair unique (swiper_id, target_id)
);

create index swipes_received_likes_idx on public.swipes (target_id) where action <> 'pass';

alter table public.swipes enable row level security;

create policy "Users insert their own swipes"
  on public.swipes for insert to authenticated
  with check (auth.uid() = swiper_id);
-- Update allowed so a pass can later become a like (and for upserts).
create policy "Users update their own swipes"
  on public.swipes for update to authenticated
  using (auth.uid() = swiper_id)
  with check (auth.uid() = swiper_id);
create policy "Users read their own swipes"
  on public.swipes for select to authenticated
  using (auth.uid() = swiper_id);

create trigger on_swipes_updated
  before update on public.swipes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. Matches — created by trigger on mutual like, never by clients
-- ============================================================
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles (id) on delete cascade,
  profile_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint matches_ordered_pair check (profile_a < profile_b),
  constraint matches_unique_pair unique (profile_a, profile_b)
);

create index matches_profile_a_idx on public.matches (profile_a);
create index matches_profile_b_idx on public.matches (profile_b);

alter table public.matches enable row level security;

create policy "Members read their own matches"
  on public.matches for select to authenticated
  using (auth.uid() in (profile_a, profile_b));
-- Unmatch = delete; row inserts happen only via the trigger below.
create policy "Members can unmatch"
  on public.matches for delete to authenticated
  using (auth.uid() in (profile_a, profile_b));

create or replace function public.sync_match_on_swipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.action in ('like', 'super_like') and exists (
    select 1 from public.swipes
    where swiper_id = new.target_id
      and target_id = new.swiper_id
      and action in ('like', 'super_like')
  ) then
    insert into public.matches (profile_a, profile_b)
    values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
    on conflict do nothing;
  elsif new.action = 'pass' then
    -- A like changed to a pass dissolves the match.
    delete from public.matches
    where profile_a = least(new.swiper_id, new.target_id)
      and profile_b = greatest(new.swiper_id, new.target_id);
  end if;
  return null;
end;
$$;

revoke execute on function public.sync_match_on_swipe() from anon, authenticated;

create trigger after_swipe_sync_match
  after insert or update of action on public.swipes
  for each row execute function public.sync_match_on_swipe();

-- ============================================================
-- 4. KYC — submissions reviewed manually by an admin
-- ============================================================
create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  doc_type text not null check (doc_type in ('cni', 'passport', 'license')),
  id_front_path text not null,
  id_back_path text,
  selfie_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index kyc_one_pending_per_profile
  on public.kyc_submissions (profile_id) where status = 'pending';
create index kyc_profile_history_idx on public.kyc_submissions (profile_id, submitted_at desc);

alter table public.kyc_submissions enable row level security;

create policy "Users read their own KYC submissions"
  on public.kyc_submissions for select to authenticated
  using (auth.uid() = profile_id);
-- Users can only open a submission in 'pending'; status transitions are done
-- by an admin (service role / SQL editor), which bypasses RLS.
create policy "Users create their own pending KYC submission"
  on public.kyc_submissions for insert to authenticated
  with check (auth.uid() = profile_id and status = 'pending');

-- Keep profiles.is_verified in sync with the review outcome, and stamp
-- reviewed_at, whenever an admin changes a submission's status.
create or replace function public.sync_kyc_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := now();
    update public.profiles
      set is_verified = (
        new.status = 'approved'
        or exists (
          select 1 from public.kyc_submissions
          where profile_id = new.profile_id and status = 'approved' and id <> new.id
        )
      )
      where id = new.profile_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.sync_kyc_verification() from anon, authenticated;

create trigger before_kyc_status_change_sync
  before update of status on public.kyc_submissions
  for each row execute function public.sync_kyc_verification();

-- Private bucket for identity documents; only the owner can read their own
-- files (signed URLs), writes go through the upload Edge Function.
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "KYC owners read their own documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 5. RPCs — discovery, public profile view, profile stats
-- ============================================================

-- Profiles' base RLS stays owner-only (rows carry email etc.); everything
-- other members may see goes through these definer functions that expose an
-- explicit, safe column list.

create or replace function public.search_profiles(
  p_age_min int default 18,
  p_age_max int default 99,
  p_max_distance_km int default null,
  p_verified_only boolean default false,
  p_new_only boolean default false,
  p_online_recently boolean default false,
  p_limit int default 25,
  p_offset int default 0
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
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = v.id and s.target_id = p.id
    )
  order by
    (v.location is not null and p.location is not null) desc,
    st_distance(p.location, v.location) asc nulls last,
    p.last_active_at desc
  limit p_limit offset p_offset
$$;

revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int) from anon;

-- Safe single-profile view for tapping a discovery card / match / chat.
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
  interest_names text[],
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
    coalesce(
      (select array_agg(i.label order by i.label)
       from public.profile_interests pi
       join public.interests i on i.id = pi.interest_id
       where pi.profile_id = p.id),
      '{}'
    ) as interest_names,
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
$$;

revoke execute on function public.get_public_profile(uuid) from anon;

-- Stats for the "Mon Profil" screen; definer because likes received are
-- other users' swipe rows, which owner-only RLS rightly hides.
create or replace function public.get_my_profile_stats()
returns table (likes_received int, matches_count int, match_rate int)
language sql
security definer
set search_path = public
as $$
  with likes as (
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
    likes.n,
    m.n,
    case when likes.n = 0 then 0 else least(100, m.n * 100 / likes.n) end
  from likes, m
$$;

revoke execute on function public.get_my_profile_stats() from anon;
