-- Sprints A2 + A3 — gestion des utilisateurs et vérification KYC côté admin.
-- Toutes les fonctions sont SECURITY DEFINER, gated par niveau de rôle
-- (viewer 0 < support 1 < moderator 2 < admin 3 < super_admin 4), revoke anon,
-- et journalisées dans admin_audit_log.

-- 'suspended' rejoint les statuts de compte (Sprint A2 : Suspend User).
alter table public.profiles drop constraint profiles_account_status_check;
alter table public.profiles add constraint profiles_account_status_check
  check (account_status = any (array['active'::text, 'suspended'::text, 'banned'::text, 'deleted'::text]));

-- Journal des actions back-office (consommé par A3 audit + A11).
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
create index admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;

-- Lecture pour l'équipe back-office ; écritures uniquement via les fonctions
-- SECURITY DEFINER ci-dessous (aucune policy d'insert côté client).
create policy "admin_audit_log_select_admins"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin());

-- Niveau hiérarchique du rôle de l'appelant (-1 si non admin).
create or replace function public.admin_role_level()
returns int
language sql
stable
security invoker
set search_path = ''
as $$
  select case (
    select role from public.admin_users
    where user_id = (select auth.uid()) and is_active
  )
    when 'super_admin' then 4
    when 'admin' then 3
    when 'moderator' then 2
    when 'support' then 1
    when 'viewer' then 0
    else -1
  end;
$$;

revoke execute on function public.admin_role_level() from public, anon;
grant execute on function public.admin_role_level() to authenticated;

-- Les admins peuvent lire les documents KYC (aperçus + URLs signées).
create policy "Admins read KYC documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'kyc-documents' and public.is_admin());

-- ────────────────────────────────────────────────────────────────────
-- A2 — Utilisateurs
-- ────────────────────────────────────────────────────────────────────

-- Liste paginée + filtrée. Retourne { total, users: [...] }.
create or replace function public.admin_list_users(
  p_query text default null,
  p_status text default null,
  p_gender text default null,
  p_verified boolean default null,
  p_limit int default 25,
  p_offset int default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if public.admin_role_level() < 0 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with filtered as (
    select p.*
    from public.profiles p
    where (p_status is null or p.account_status = p_status)
      and (p_gender is null or p.gender = p_gender)
      and (p_verified is null or p.is_verified = p_verified)
      and (
        p_query is null or p_query = '' or
        p.first_name ilike '%' || p_query || '%' or
        p.last_name ilike '%' || p_query || '%' or
        p.email ilike '%' || p_query || '%' or
        p.city ilike '%' || p_query || '%'
      )
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'users', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', f.id,
        'first_name', f.first_name,
        'last_name', f.last_name,
        'email', f.email,
        'gender', f.gender,
        'city', f.city,
        'country', f.country,
        'avatar_url', f.avatar_url,
        'account_status', f.account_status,
        'is_verified', f.is_verified,
        'profile_completed', f.profile_completed,
        'created_at', f.created_at,
        'last_active_at', f.last_active_at,
        'kyc_status', (select k.status from public.kyc_submissions k
                       where k.profile_id = f.id
                       order by k.submitted_at desc limit 1),
        'is_premium', exists (select 1 from public.subscriptions s
                              where s.profile_id = f.id and s.status = 'active'
                                and (s.expires_at is null or s.expires_at > now()))
      )), '[]'::jsonb)
      from (select * from filtered
            order by last_active_at desc
            limit v_limit offset v_offset) f
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_list_users(text, text, text, boolean, int, int) from public, anon;
grant execute on function public.admin_list_users(text, text, text, boolean, int, int) to authenticated;

-- Fiche complète d'un membre : profil, auth, photos, référentiels, matchs,
-- conversations, signalements, KYC, appareils, historique de connexion, audit.
create or replace function public.admin_get_user_details(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if public.admin_role_level() < 0 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'profile', to_jsonb(p) - 'location' - 'notification_prefs' - 'privacy_prefs',
    'auth', (
      select jsonb_build_object(
        'email', u.email,
        'created_at', u.created_at,
        'email_confirmed_at', u.email_confirmed_at,
        'last_sign_in_at', u.last_sign_in_at
      ) from auth.users u where u.id = p.id
    ),
    'is_admin_account', exists (
      select 1 from public.admin_users au where au.user_id = p.id and au.is_active
    ),
    'photos', (
      select coalesce(jsonb_agg(to_jsonb(ph) order by ph.position), '[]'::jsonb)
      from public.profile_photos ph where ph.profile_id = p.id
    ),
    'interests', (
      select coalesce(jsonb_agg(i.label order by i.label), '[]'::jsonb)
      from public.profile_interests pi
      join public.interests i on i.id = pi.interest_id
      where pi.profile_id = p.id
    ),
    'languages', (
      select coalesce(jsonb_agg(l.label order by l.label), '[]'::jsonb)
      from public.profile_languages pl
      join public.languages l on l.id = pl.language_id
      where pl.profile_id = p.id
    ),
    'relationship_goal', (
      select rg.label from public.relationship_goals rg where rg.id = p.relationship_goal_id
    ),
    'religion', (
      select r.label from public.religions r where r.id = p.religion_id
    ),
    'subscription', (
      select jsonb_build_object(
        'plan_label', pp.label, 'status', s.status,
        'starts_at', s.starts_at, 'expires_at', s.expires_at, 'provider', s.provider
      )
      from public.subscriptions s
      join public.premium_plans pp on pp.key = s.plan_key
      where s.profile_id = p.id
      order by s.created_at desc limit 1
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'platform', pt.platform, 'updated_at', pt.updated_at,
        'token_preview', left(pt.token, 18) || '…'
      ) order by pt.updated_at desc), '[]'::jsonb)
      from public.push_tokens pt where pt.profile_id = p.id
    ),
    'kyc', (
      select coalesce(jsonb_agg(to_jsonb(k) order by k.submitted_at desc), '[]'::jsonb)
      from public.kyc_submissions k where k.profile_id = p.id
    ),
    'reports_received', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'reason', r.reason, 'details', r.details, 'status', r.status,
        'created_at', r.created_at,
        'reporter_name', (select pr.first_name from public.profiles pr where pr.id = r.reporter_id)
      ) order by r.created_at desc), '[]'::jsonb)
      from public.reports r where r.reported_id = p.id
    ),
    'reports_made', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'reason', r.reason, 'status', r.status, 'created_at', r.created_at,
        'reported_name', (select pr.first_name from public.profiles pr where pr.id = r.reported_id)
      ) order by r.created_at desc), '[]'::jsonb)
      from public.reports r where r.reporter_id = p.id
    ),
    'conversations', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'match_id', m.id,
        'matched_at', m.created_at,
        'partner_id', case when m.profile_a = p.id then m.profile_b else m.profile_a end,
        'partner_name', (select pr.first_name from public.profiles pr
                         where pr.id = case when m.profile_a = p.id then m.profile_b else m.profile_a end),
        'partner_avatar', (select pr.avatar_url from public.profiles pr
                           where pr.id = case when m.profile_a = p.id then m.profile_b else m.profile_a end),
        'message_count', (select count(*) from public.messages msg where msg.match_id = m.id),
        'last_message_at', (select max(msg.created_at) from public.messages msg where msg.match_id = m.id)
      ) order by m.created_at desc), '[]'::jsonb)
      from public.matches m
      where m.profile_a = p.id or m.profile_b = p.id
    ),
    'login_history', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'action', a.payload ->> 'action',
        'created_at', a.created_at,
        'ip', coalesce(nullif(a.ip_address, ''), null)
      ) order by a.created_at desc), '[]'::jsonb)
      from (
        select * from auth.audit_log_entries ale
        where ale.payload ->> 'actor_id' = p.id::text
          and ale.payload ->> 'action' in ('login', 'logout', 'user_signedup', 'user_recovery_requested')
        order by ale.created_at desc limit 15
      ) a
    ),
    'admin_log', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'action', al.action, 'meta', al.meta, 'created_at', al.created_at,
        'admin_name', (select au.display_name from public.admin_users au where au.user_id = al.admin_id)
      ) order by al.created_at desc), '[]'::jsonb)
      from (
        select * from public.admin_audit_log
        where target_type = 'user' and target_id = p.id::text
        order by created_at desc limit 10
      ) al
    )
  ) into result
  from public.profiles p
  where p.id = p_user_id;

  if result is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke execute on function public.admin_get_user_details(uuid) from public, anon;
grant execute on function public.admin_get_user_details(uuid) to authenticated;

-- Édition (whitelist de champs) — rôle admin minimum.
create or replace function public.admin_update_profile(p_user_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  updated public.profiles;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  update public.profiles p set
    first_name = case when p_patch ? 'first_name' then nullif(trim(p_patch ->> 'first_name'), '') else p.first_name end,
    last_name  = case when p_patch ? 'last_name'  then nullif(trim(p_patch ->> 'last_name'), '')  else p.last_name end,
    bio        = case when p_patch ? 'bio'        then nullif(trim(p_patch ->> 'bio'), '')        else p.bio end,
    city       = case when p_patch ? 'city'       then nullif(trim(p_patch ->> 'city'), '')       else p.city end,
    country    = case when p_patch ? 'country'    then nullif(trim(p_patch ->> 'country'), '')    else p.country end,
    profession = case when p_patch ? 'profession' then nullif(trim(p_patch ->> 'profession'), '') else p.profession end,
    gender     = case when p_patch ? 'gender'     then nullif(p_patch ->> 'gender', '')           else p.gender end,
    birth_date = case when p_patch ? 'birth_date' then nullif(p_patch ->> 'birth_date', '')::date else p.birth_date end
  where p.id = p_user_id
  returning p.* into updated;

  if updated.id is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.update', 'user', p_user_id::text,
          jsonb_build_object('fields', (select jsonb_agg(k) from jsonb_object_keys(p_patch) k)));

  return to_jsonb(updated) - 'location' - 'notification_prefs' - 'privacy_prefs';
end;
$$;

revoke execute on function public.admin_update_profile(uuid, jsonb) from public, anon;
grant execute on function public.admin_update_profile(uuid, jsonb) to authenticated;

-- Suspension / bannissement / réactivation — rôle moderator minimum.
-- Les comptes back-office ne sont pas modérables depuis le dashboard.
create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status text,
  p_reason text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if p_status not in ('active', 'suspended', 'banned') then
    raise exception 'invalid status %', p_status;
  end if;
  if exists (select 1 from public.admin_users au where au.user_id = p_user_id and au.is_active) then
    raise exception 'cannot moderate a back-office account' using errcode = '42501';
  end if;

  update public.profiles set
    account_status = p_status,
    status_reason = case when p_status = 'active' then null else p_reason end,
    status_changed_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.status.' || p_status, 'user', p_user_id::text,
          jsonb_build_object('reason', p_reason));
end;
$$;

revoke execute on function public.admin_set_account_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_account_status(uuid, text, text) to authenticated;

-- Badge « profil vérifié » — rôle moderator minimum.
create or replace function public.admin_set_profile_verified(p_user_id uuid, p_verified boolean)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  update public.profiles set is_verified = p_verified where id = p_user_id;
  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()),
          case when p_verified then 'user.verify' else 'user.unverify' end,
          'user', p_user_id::text, '{}'::jsonb);
end;
$$;

revoke execute on function public.admin_set_profile_verified(uuid, boolean) from public, anon;
grant execute on function public.admin_set_profile_verified(uuid, boolean) to authenticated;

-- Confirmation manuelle de l'adresse e-mail — rôle admin minimum.
create or replace function public.admin_verify_email(p_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = p_user_id;
  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.email_verified', 'user', p_user_id::text, '{}'::jsonb);
end;
$$;

revoke execute on function public.admin_verify_email(uuid) from public, anon;
grant execute on function public.admin_verify_email(uuid) to authenticated;

-- Suppression définitive (cascade auth → profil → données) — super_admin.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if public.admin_role_level() < 4 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot delete your own account' using errcode = '42501';
  end if;
  if exists (select 1 from public.admin_users au where au.user_id = p_user_id and au.is_active) then
    raise exception 'cannot delete a back-office account' using errcode = '42501';
  end if;

  select email into v_email from auth.users where id = p_user_id;
  if v_email is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.delete', 'user', p_user_id::text,
          jsonb_build_object('email', v_email));

  delete from auth.users where id = p_user_id;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- Lecture d'une conversation (modération) — rôle moderator minimum, tracée.
create or replace function public.admin_conversation_messages(p_match_id uuid, p_limit int default 50)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', msg.id,
    'sender_id', msg.sender_id,
    'sender_name', (select pr.first_name from public.profiles pr where pr.id = msg.sender_id),
    'content', msg.content,
    'created_at', msg.created_at,
    'read_at', msg.read_at
  ) order by msg.created_at), '[]'::jsonb) into result
  from (
    select * from public.messages
    where match_id = p_match_id
    order by created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200)
  ) msg;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'conversation.view', 'match', p_match_id::text, '{}'::jsonb);

  return result;
end;
$$;

revoke execute on function public.admin_conversation_messages(uuid, int) from public, anon;
grant execute on function public.admin_conversation_messages(uuid, int) to authenticated;

-- ────────────────────────────────────────────────────────────────────
-- A3 — KYC
-- ────────────────────────────────────────────────────────────────────

-- File de vérification : { total, counts: {pending, approved, rejected}, items }.
create or replace function public.admin_list_kyc(
  p_status text default 'pending',
  p_query text default null,
  p_limit int default 25,
  p_offset int default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with base as (
    select k.*, p.first_name, p.last_name, p.email, p.avatar_url, p.city, p.country
    from public.kyc_submissions k
    join public.profiles p on p.id = k.profile_id
    where (p_status is null or k.status = p_status)
      and (
        p_query is null or p_query = '' or
        p.first_name ilike '%' || p_query || '%' or
        p.last_name ilike '%' || p_query || '%' or
        p.email ilike '%' || p_query || '%'
      )
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'counts', (
      select jsonb_object_agg(s.status, s.cnt) from (
        select k.status, count(*) as cnt from public.kyc_submissions k group by k.status
      ) s
    ),
    'items', (
      select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb)
      from (select * from base
            order by submitted_at desc
            limit v_limit offset v_offset) b
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_list_kyc(text, text, int, int) from public, anon;
grant execute on function public.admin_list_kyc(text, text, int, int) to authenticated;

-- Approbation / rejet (unitaire ou en masse) — rôle moderator minimum.
-- Le trigger sync_kyc_verification maintient profiles.is_verified.
create or replace function public.admin_review_kyc(
  p_ids uuid[],
  p_status text,
  p_reason text default null
)
returns int
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'invalid status %', p_status;
  end if;
  if p_status = 'rejected' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'rejection reason required';
  end if;

  update public.kyc_submissions set
    status = p_status,
    rejection_reason = case when p_status = 'rejected' then p_reason else null end,
    reviewed_at = now()
  where id = any (p_ids);

  get diagnostics v_count = row_count;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  select (select auth.uid()), 'kyc.' || p_status, 'kyc', k::text,
         jsonb_build_object('reason', p_reason)
  from unnest(p_ids) as k;

  return v_count;
end;
$$;

revoke execute on function public.admin_review_kyc(uuid[], text, text) from public, anon;
grant execute on function public.admin_review_kyc(uuid[], text, text) to authenticated;
