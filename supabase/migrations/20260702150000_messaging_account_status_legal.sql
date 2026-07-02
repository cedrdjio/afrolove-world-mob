-- Real messaging, account lifecycle (soft delete / ban with flag), and
-- admin-editable legal documents. All admin actions (ban, legal edits, KYC
-- review) go through service_role — i.e. the future NestJS dashboard.

-- ============================================================
-- 1. Account status — deletion is a flag, never a row removal.
--    A returning banned user is recognized because the row survives.
-- ============================================================
alter table public.profiles
  add column account_status text not null default 'active'
    check (account_status in ('active', 'banned', 'deleted')),
  add column status_reason text,
  add column status_changed_at timestamptz;

create index profiles_flagged_status_idx
  on public.profiles (account_status) where account_status <> 'active';

-- Users may only self-delete or reactivate their own deleted account.
-- Ban / unban is admin-only (service_role bypasses RLS; auth.uid() is null).
create or replace function public.guard_account_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_status is distinct from old.account_status then
    if auth.uid() = new.id and not (
      (old.account_status = 'active' and new.account_status = 'deleted')
      or (old.account_status = 'deleted' and new.account_status = 'active')
    ) then
      raise exception 'Transition de statut de compte non autorisée';
    end if;
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_account_status() from public, anon, authenticated;

create trigger before_profiles_status_guard
  before update of account_status on public.profiles
  for each row execute function public.guard_account_status();

-- ============================================================
-- 2. Messages — one conversation per match
-- ============================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_match_created_idx on public.messages (match_id, created_at desc);
create index messages_unread_idx on public.messages (match_id) where read_at is null;

alter table public.messages enable row level security;

create policy "Members read their conversations"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and auth.uid() in (m.profile_a, m.profile_b)
    )
  );

-- Sending requires being an active member of the match — a banned or
-- self-deleted account keeps a valid JWT until it expires, so the check
-- must live here, not only in the app's routing.
create policy "Members send in their conversations"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id and auth.uid() in (m.profile_a, m.profile_b)
    )
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.account_status = 'active'
    )
  );

-- Live delivery for open chats.
alter publication supabase_realtime add table public.messages;

-- read_at is only ever set through this RPC (the recipient marking the
-- partner's messages read) — no generic update policy on messages.
create or replace function public.mark_messages_read(p_match_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages
  set read_at = now()
  where match_id = p_match_id
    and read_at is null
    and sender_id <> auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = p_match_id and auth.uid() in (m.profile_a, m.profile_b)
    );
$$;

revoke execute on function public.mark_messages_read(uuid) from public, anon;
grant execute on function public.mark_messages_read(uuid) to authenticated;

-- ============================================================
-- 3. Conversation / match list RPC — partner columns are exposed through a
--    definer function because profiles RLS is owner-only by design.
-- ============================================================
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
  order by coalesce(lm.created_at, m.created_at) desc
$$;

revoke execute on function public.get_my_conversations() from public, anon;
grant execute on function public.get_my_conversations() to authenticated;

-- ============================================================
-- 4. Hide banned/deleted accounts from discovery and public profiles
-- ============================================================
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
    and p.account_status = 'active'
$$;

revoke execute on function public.get_public_profile(uuid) from public, anon;
grant execute on function public.get_public_profile(uuid) to authenticated;

-- ============================================================
-- 5. Legal documents — content is data, edited from the dashboard,
--    versioned so the app can re-ask consent when terms change.
-- ============================================================
create table public.legal_documents (
  key text primary key,
  title text not null,
  content text not null,
  version int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.legal_documents enable row level security;

-- Readable before signup (the register screen shows them to anonymous users).
create policy "Legal documents are readable by everyone"
  on public.legal_documents for select to anon, authenticated using (true);

insert into public.legal_documents (key, title, content) values
(
  'terms',
  'Conditions Générales d''Utilisation',
  E'# Conditions Générales d''Utilisation\n\n_Document provisoire — la version finale rédigée par notre conseil juridique le remplacera prochainement._\n\n## 1. Objet\nLes présentes conditions régissent l''utilisation de l''application AfroLove World, service de mise en relation destiné aux personnes majeures (18 ans et plus).\n\n## 2. Inscription et compte\nVous certifiez avoir 18 ans révolus et fournir des informations exactes. Chaque personne ne peut détenir qu''un seul compte. Le compte est strictement personnel.\n\n## 3. Comportement\nSont interdits : le harcèlement, les propos haineux, l''usurpation d''identité, les sollicitations commerciales et tout contenu illicite. Tout manquement peut entraîner la suspension ou le bannissement définitif du compte.\n\n## 4. Vérification d''identité\nLa vérification (badge) repose sur l''examen de documents d''identité, traités de manière confidentielle et supprimés après examen.\n\n## 5. Abonnements\nCertaines fonctionnalités sont payantes. Les conditions de facturation et de résiliation sont précisées au moment de l''achat.\n\n## 6. Responsabilité\nAfroLove World met en relation ses membres mais ne garantit pas l''issue des rencontres. Faites preuve de prudence lors de vos échanges et rencontres.\n\n## 7. Résiliation\nVous pouvez supprimer votre compte à tout moment depuis les paramètres de l''application.\n\n## 8. Contact\nsupport@afriloveworld.com'
),
(
  'privacy',
  'Politique de Confidentialité',
  E'# Politique de Confidentialité\n\n_Document provisoire — la version finale rédigée par notre conseil juridique le remplacera prochainement._\n\n## 1. Données collectées\nNous collectons les données que vous fournissez (profil, photos, préférences), votre localisation approximative (avec votre accord) et, pour la vérification d''identité, vos documents officiels.\n\n## 2. Finalités\nCes données servent exclusivement à : proposer des profils compatibles à proximité, sécuriser la plateforme (vérification, modération) et améliorer le service.\n\n## 3. Localisation\nVotre position précise n''est jamais montrée aux autres membres — seule une distance approximative est affichée. Vous pouvez désactiver la localisation à tout moment.\n\n## 4. Documents d''identité\nLes documents KYC sont stockés chiffrés dans un espace privé, accessibles uniquement à l''équipe de vérification, et supprimés après examen.\n\n## 5. Partage\nVos données ne sont jamais vendues. Elles ne sont partagées qu''avec nos sous-traitants techniques (hébergement) dans le respect du RGPD.\n\n## 6. Vos droits\nVous disposez d''un droit d''accès, de rectification, de suppression et de portabilité. Exercez-les depuis les paramètres ou en écrivant à privacy@afriloveworld.com.\n\n## 7. Conservation\nLes données d''un compte supprimé sont conservées de manière minimale le temps nécessaire à la prévention des fraudes et récidives de bannissement, puis anonymisées.'
);
