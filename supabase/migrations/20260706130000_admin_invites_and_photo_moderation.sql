-- Sprint A11 —
-- 1. Invitations admin par e-mail, même si la personne n'a pas encore de
--    compte : l'accès est pré-enregistré et attribué automatiquement à sa
--    première connexion. (Avant : admin_grant_role échouait si l'e-mail
--    n'était pas déjà dans auth.users, ce qui n'avait pas de sens.)
-- 2. Modération des images : chaque photo porte un statut (approved/flagged/
--    hidden). Une photo masquée disparaît des profils publics et de l'avatar.

-- ============================================================
-- 1. Invitations admin en attente
-- ============================================================
create table public.admin_invites (
  email text primary key,
  role public.admin_role not null default 'viewer',
  display_name text,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.admin_invites enable row level security;
-- Aucune policy : lu/écrit uniquement via les RPC definer ci-dessous.

-- Attribue un rôle par e-mail. Si le compte existe déjà → admin_users
-- immédiatement ; sinon → invitation en attente, consommée à l'inscription.
create or replace function public.admin_grant_role(
  p_email text, p_role public.admin_role, p_display_name text default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid;
  v_email text := lower(trim(p_email));
begin
  if public.admin_role_level() < 4 then
    raise exception 'super admin required' using errcode = '42501';
  end if;
  if v_email is null or v_email = '' or position('@' in v_email) = 0 then
    raise exception 'Adresse e-mail invalide.' using errcode = '22023';
  end if;

  select id into v_uid from auth.users where lower(email) = v_email;

  if v_uid is null then
    -- Pas encore de compte : on mémorise l'invitation. Elle sera transformée
    -- en accès réel par le trigger d'inscription (handle_new_user).
    insert into public.admin_invites (email, role, display_name, invited_by)
    values (v_email, p_role, nullif(trim(coalesce(p_display_name, '')), ''), (select auth.uid()))
    on conflict (email) do update set
      role = excluded.role,
      display_name = coalesce(excluded.display_name, public.admin_invites.display_name),
      invited_by = excluded.invited_by,
      created_at = now();
    insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
    values ((select auth.uid()), 'admin.invite', 'admin', v_email,
            jsonb_build_object('role', p_role, 'email', v_email));
    return;
  end if;

  insert into public.admin_users (user_id, role, display_name, is_active)
  values (v_uid, p_role, coalesce(nullif(trim(coalesce(p_display_name, '')), ''), split_part(v_email, '@', 1)), true)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = coalesce(excluded.display_name, public.admin_users.display_name),
    is_active = true;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'admin.grant', 'admin', v_uid::text,
          jsonb_build_object('role', p_role, 'email', v_email));
end; $$;

revoke execute on function public.admin_grant_role(text, public.admin_role, text) from public, anon;
grant execute on function public.admin_grant_role(text, public.admin_role, text) to authenticated;

-- Annule une invitation encore en attente.
create or replace function public.admin_cancel_invite(p_email text)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 4 then
    raise exception 'super admin required' using errcode = '42501';
  end if;
  delete from public.admin_invites where email = lower(trim(p_email));
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'admin.invite_cancel', 'admin', lower(trim(p_email)), '{}'::jsonb);
end; $$;

revoke execute on function public.admin_cancel_invite(text) from public, anon;
grant execute on function public.admin_cancel_invite(text) to authenticated;

-- La liste des accès inclut désormais les invitations en attente
-- (user_id null, pending true) pour que le super admin les voie et les gère.
create or replace function public.admin_list_admins()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 4 then raise exception 'super admin required' using errcode = '42501'; end if;
  return (
    select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select au.user_id, au.role::text as role, au.display_name, au.is_active,
             au.created_at, u.email, u.last_sign_in_at, false as pending
      from public.admin_users au join auth.users u on u.id = au.user_id
      union all
      select null::uuid, ai.role::text, ai.display_name, true, ai.created_at,
             ai.email, null::timestamptz, true
      from public.admin_invites ai
      order by pending, created_at
    ) t
  );
end; $$;

revoke execute on function public.admin_list_admins() from public, anon;
grant execute on function public.admin_list_admins() to authenticated;

-- À l'inscription : si l'e-mail correspond à une invitation, on l'active.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.admin_invites;
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), '')
  )
  on conflict (id) do nothing;

  select * into v_invite from public.admin_invites where email = lower(new.email);
  if found then
    insert into public.admin_users (user_id, role, display_name, is_active)
    values (new.id, v_invite.role,
            coalesce(v_invite.display_name, split_part(new.email, '@', 1)), true)
    on conflict (user_id) do update set role = excluded.role, is_active = true;
    delete from public.admin_invites where email = v_invite.email;
  end if;

  return new;
end;
$$;

-- ============================================================
-- 2. Modération des images
-- ============================================================
alter table public.profile_photos
  add column moderation_status text not null default 'approved'
    check (moderation_status in ('approved', 'flagged', 'hidden')),
  add column moderation_note text,
  add column moderated_by uuid references auth.users (id) on delete set null,
  add column moderated_at timestamptz;

create index profile_photos_moderation_idx on public.profile_photos (moderation_status)
  where moderation_status <> 'approved';

-- Une photo masquée ne doit plus apparaître : on la retire de l'avatar
-- dénormalisé (le trigger de sync ignore désormais les photos cachées).
create or replace function public.sync_profile_avatar()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_profile_id uuid := coalesce(new.profile_id, old.profile_id);
begin
  update public.profiles
    set avatar_url = (
      select url from public.profile_photos
      where profile_id = target_profile_id and moderation_status <> 'hidden'
      order by is_primary desc, position asc, created_at asc
      limit 1
    )
    where id = target_profile_id;
  return null;
end;
$$;

-- Re-synchronise l'avatar quand le statut de modération change.
create trigger after_photo_moderation_sync_avatar
  after update of moderation_status on public.profile_photos
  for each row execute function public.sync_profile_avatar();

-- Les photos masquées disparaissent aussi des profils publics.
drop function public.get_public_profile(uuid);
create or replace function public.get_public_profile(p_profile_id uuid)
returns table (
  id uuid, first_name text, age int, gender text, city text, country text,
  bio text, profession text, height_cm smallint, is_verified boolean,
  avatar_url text, distance_km numeric, smoking text, drinking text,
  gym_habit text, has_pets text, wants_children text, religion_id uuid,
  education_level_id uuid, interest_ids uuid[], language_ids uuid[],
  photo_urls text[], last_active_at timestamptz
)
language sql security definer set search_path = public, extensions
as $$
  select
    p.id, p.first_name, date_part('year', age(p.birth_date))::int as age,
    p.gender, p.city, p.country, p.bio, p.profession, p.height_cm,
    p.is_verified, p.avatar_url,
    case when v.location is not null and p.location is not null
      then round((st_distance(p.location, v.location) / 1000)::numeric, 1) end as distance_km,
    p.smoking, p.drinking, p.gym_habit, p.has_pets, p.wants_children,
    p.religion_id, p.education_level_id,
    coalesce((select array_agg(pi.interest_id) from public.profile_interests pi where pi.profile_id = p.id), '{}') as interest_ids,
    coalesce((select array_agg(pl.language_id) from public.profile_languages pl where pl.profile_id = p.id), '{}') as language_ids,
    coalesce(
      (select array_agg(ph.url order by ph.is_primary desc, ph.position)
       from public.profile_photos ph
       where ph.profile_id = p.id and ph.moderation_status <> 'hidden'),
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

-- File de modération des photos (les plus récentes d'abord, filtrable par
-- statut). moderator (>=2) et plus.
create or replace function public.admin_list_photos(
  p_status text default null, p_query text default null,
  p_limit int default 30, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 30), 1), 100);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with base as (
    select ph.id, ph.url, ph.profile_id, ph.is_primary, ph.moderation_status,
           ph.moderation_note, ph.moderated_at, ph.created_at,
           pr.first_name, pr.email, pr.account_status,
           (select count(*) from public.reports r
              where r.reported_id = ph.profile_id and r.status = 'open') as open_reports
    from public.profile_photos ph
    join public.profiles pr on pr.id = ph.profile_id
    where (p_status is null or p_status = '' or ph.moderation_status = p_status)
      and (p_query is null or p_query = ''
           or pr.first_name ilike '%' || p_query || '%'
           or pr.email ilike '%' || p_query || '%')
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'items', (
      select coalesce(jsonb_agg(row_to_json(b) order by b.open_reports desc, b.created_at desc), '[]'::jsonb)
      from (select * from base order by open_reports desc, created_at desc limit v_limit offset v_offset) b
    )
  ) into result;
  return result;
end; $$;

revoke execute on function public.admin_list_photos(text, text, int, int) from public, anon;
grant execute on function public.admin_list_photos(text, text, int, int) to authenticated;

-- Action de modération sur une photo : approve / flag / hide.
create or replace function public.admin_moderate_photo(
  p_photo_id uuid, p_action text, p_note text default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_status text;
  v_owner uuid;
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  v_status := case p_action
    when 'approve' then 'approved'
    when 'flag' then 'flagged'
    when 'hide' then 'hidden'
    else null end;
  if v_status is null then
    raise exception 'unknown action %', p_action;
  end if;

  update public.profile_photos
    set moderation_status = v_status,
        moderation_note = nullif(trim(coalesce(p_note, '')), ''),
        moderated_by = (select auth.uid()),
        moderated_at = now()
    where id = p_photo_id
    returning profile_id into v_owner;

  if v_owner is null then
    raise exception 'photo introuvable';
  end if;

  -- Prévenir le membre quand une photo est masquée.
  if v_status = 'hidden' then
    insert into public.notifications (profile_id, type, title, body, data)
    values (v_owner, 'admin', 'Photo masquée',
            'Une de vos photos a été masquée car elle ne respecte pas nos règles. Vous pouvez la remplacer.',
            jsonb_build_object('photo_id', p_photo_id));
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'photo.' || p_action, 'photo', p_photo_id::text,
          jsonb_build_object('owner', v_owner, 'note', p_note));
end; $$;

revoke execute on function public.admin_moderate_photo(uuid, text, text) from public, anon;
grant execute on function public.admin_moderate_photo(uuid, text, text) to authenticated;
