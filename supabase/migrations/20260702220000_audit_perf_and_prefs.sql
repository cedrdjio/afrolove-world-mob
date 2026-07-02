-- General audit follow-up.
-- A) Performance (from the database linter):
--    - wrap every per-row auth.uid() policy call in (select auth.uid())
--    - cover all unindexed foreign keys
--    - remove duplicate permissive SELECT policies on the junction tables
-- B) Real user preferences:
--    - notification_prefs: honored by the push fan-out trigger
--    - privacy_prefs: honored by search/profile/conversation RPCs
--      (visibility on discovery, distance, age, online status)

-- ============================================================
-- A1. Missing foreign-key indexes
-- ============================================================
create index messages_sender_idx on public.messages (sender_id);
create index profile_interests_interest_idx on public.profile_interests (interest_id);
create index profile_languages_language_idx on public.profile_languages (language_id);
create index profiles_religion_idx on public.profiles (religion_id) where religion_id is not null;
create index profiles_education_idx on public.profiles (education_level_id) where education_level_id is not null;
create index profiles_relationship_goal_idx on public.profiles (relationship_goal_id) where relationship_goal_id is not null;
create index reports_reporter_idx on public.reports (reporter_id);
create index subscriptions_plan_idx on public.subscriptions (plan_key);

-- ============================================================
-- A2. auth.uid() → (select auth.uid()) in every flagged policy
-- ============================================================
alter policy "Profiles are viewable by owner" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Profiles are insertable by owner" on public.profiles
  with check ((select auth.uid()) = id);
alter policy "Profiles are updatable by owner" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Users insert their own swipes" on public.swipes
  with check ((select auth.uid()) = swiper_id);
alter policy "Users update their own swipes" on public.swipes
  using ((select auth.uid()) = swiper_id)
  with check ((select auth.uid()) = swiper_id);
alter policy "Users read their own swipes" on public.swipes
  using ((select auth.uid()) = swiper_id);

alter policy "Members read their own matches" on public.matches
  using ((select auth.uid()) in (profile_a, profile_b));
alter policy "Members can unmatch" on public.matches
  using ((select auth.uid()) in (profile_a, profile_b));

alter policy "Users read their own KYC submissions" on public.kyc_submissions
  using ((select auth.uid()) = profile_id);
alter policy "Users create their own pending KYC submission" on public.kyc_submissions
  with check ((select auth.uid()) = profile_id and status = 'pending');

alter policy "Members read their conversations" on public.messages
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (select auth.uid()) in (m.profile_a, m.profile_b)
    )
  );
alter policy "Members send in their conversations" on public.messages
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (select auth.uid()) in (m.profile_a, m.profile_b)
        and not public.is_blocked_between(m.profile_a, m.profile_b)
    )
    and exists (
      select 1 from public.profiles me
      where me.id = (select auth.uid()) and me.account_status = 'active'
    )
  );

alter policy "Members file reports" on public.reports
  with check ((select auth.uid()) = reporter_id);

alter policy "Members manage their own blocks" on public.blocks
  using ((select auth.uid()) = blocker_id)
  with check ((select auth.uid()) = blocker_id);

alter policy "Members read their own notifications" on public.notifications
  using ((select auth.uid()) = profile_id);
alter policy "Members mark their own notifications read" on public.notifications
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

alter policy "Members manage their own push tokens" on public.push_tokens
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

alter policy "Members read their own subscriptions" on public.subscriptions
  using ((select auth.uid()) = profile_id);

-- ============================================================
-- A3. Junction tables: "manage own" was FOR ALL, whose SELECT arm
--     duplicated the public-read policy. Re-split without SELECT.
-- ============================================================
drop policy "Users manage their own photos" on public.profile_photos;
create policy "Users insert their own photos" on public.profile_photos
  for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Users update their own photos" on public.profile_photos
  for update to authenticated
  using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);
create policy "Users delete their own photos" on public.profile_photos
  for delete to authenticated using ((select auth.uid()) = profile_id);

drop policy "Users manage their own interests" on public.profile_interests;
create policy "Users insert their own interests" on public.profile_interests
  for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Users delete their own interests" on public.profile_interests
  for delete to authenticated using ((select auth.uid()) = profile_id);

drop policy "Users manage their own languages" on public.profile_languages;
create policy "Users insert their own languages" on public.profile_languages
  for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "Users delete their own languages" on public.profile_languages
  for delete to authenticated using ((select auth.uid()) = profile_id);

-- ============================================================
-- B1. Preference columns
-- ============================================================
alter table public.profiles
  add column notification_prefs jsonb not null default '{}'::jsonb,
  add column privacy_prefs jsonb not null default '{}'::jsonb;

-- ============================================================
-- B2. Push fan-out honors notification_prefs (absent key = enabled).
--     The in-app notification row is always created (it's the inbox);
--     only the push is muted.
-- ============================================================
create or replace function public.send_push_on_notification()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  device record;
  pref_key text;
  enabled boolean;
begin
  pref_key := case new.type
    when 'like' then 'likes'
    when 'match' then 'matches'
    when 'message' then 'messages'
    else new.type
  end;

  select coalesce((notification_prefs ->> pref_key)::boolean, true)
    into enabled
    from public.profiles where id = new.profile_id;
  if not coalesce(enabled, true) then
    return null;
  end if;

  for device in
    select token from public.push_tokens where profile_id = new.profile_id
  loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'to', device.token,
        'title', new.title,
        'body', coalesce(new.body, ''),
        'data', new.data || jsonb_build_object('type', new.type),
        'sound', 'default',
        'priority', 'high'
      )
    );
  end loop;
  return null;
end;
$$;

revoke execute on function public.send_push_on_notification() from public, anon, authenticated;

-- ============================================================
-- B3. Privacy prefs honored by the read RPCs. Helper first.
-- ============================================================
create or replace function public.privacy_pref(p jsonb, k text)
returns boolean
language sql
immutable
as $$ select coalesce((p ->> k)::boolean, true) $$;

revoke execute on function public.privacy_pref(jsonb, text) from public, anon;
grant execute on function public.privacy_pref(jsonb, text) to authenticated;

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
    case when public.privacy_pref(p.privacy_prefs, 'showAge')
      then date_part('year', age(p.birth_date))::int end as age,
    p.gender,
    p.city,
    p.country,
    p.bio,
    p.is_verified,
    p.avatar_url,
    case
      when public.privacy_pref(p.privacy_prefs, 'showDistance')
        and v.location is not null and p.location is not null
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
    case when public.privacy_pref(p.privacy_prefs, 'showOnline') then p.last_active_at end as last_active_at,
    p.created_at
  from public.profiles p, viewer v
  where p.id <> v.id
    and p.profile_completed
    and p.account_status = 'active'
    and public.privacy_pref(p.privacy_prefs, 'showOnDiscovery')
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
    and (
      not p_online_recently
      or (public.privacy_pref(p.privacy_prefs, 'showOnline') and p.last_active_at > now() - interval '1 hour')
    )
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
    case when public.privacy_pref(p.privacy_prefs, 'showAge')
      then date_part('year', age(p.birth_date))::int end as age,
    p.gender,
    p.city,
    p.country,
    p.bio,
    p.profession,
    p.height_cm,
    p.is_verified,
    p.avatar_url,
    case
      when public.privacy_pref(p.privacy_prefs, 'showDistance')
        and v.location is not null and p.location is not null
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
    case when public.privacy_pref(p.privacy_prefs, 'showOnline') then p.last_active_at end as last_active_at
  from public.profiles p
  left join public.profiles v on v.id = auth.uid()
  where p.id = p_profile_id
    and p.profile_completed
    and p.account_status = 'active'
    and not public.is_blocked_between(auth.uid(), p.id)
$$;

revoke execute on function public.get_public_profile(uuid) from public, anon;
grant execute on function public.get_public_profile(uuid) to authenticated;

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
    case when public.privacy_pref(p.privacy_prefs, 'showOnline') then p.last_active_at end,
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

-- ============================================================
-- B4. Brand rename in the seeded legal documents
-- ============================================================
update public.legal_documents
set content = replace(content, 'AfroLove World', 'AfriLove World'),
    title = replace(title, 'AfroLove', 'AfriLove'),
    updated_at = now()
where content like '%AfroLove%' or title like '%AfroLove%';
