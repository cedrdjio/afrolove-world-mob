-- Sprints A4 + A5 — modération et premium côté admin.
-- SECURITY DEFINER gated par niveau de rôle, revoke anon, tout journalisé.

-- Bannissement temporaire : borne de fin (une restauration éventuelle sera
-- gérée par un job ultérieur ; le dashboard affiche l'échéance).
alter table public.profiles add column if not exists suspended_until timestamptz;

-- ── Avertissements (A4) ──────────────────────────────────────────────
create table public.admin_warnings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  admin_id uuid references auth.users (id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create index admin_warnings_profile_idx on public.admin_warnings (profile_id, created_at desc);
alter table public.admin_warnings enable row level security;

-- L'équipe back-office lit tout ; le membre pourra lire ses propres
-- avertissements (utile pour un futur affichage in-app).
create policy "admin_warnings_select_admin"
  on public.admin_warnings for select to authenticated
  using (public.is_admin());
create policy "admin_warnings_select_own"
  on public.admin_warnings for select to authenticated
  using (profile_id = (select auth.uid()));

-- ── Coupons / promotions (A5) ────────────────────────────────────────
create table public.coupons (
  code text primary key,
  description text,
  discount_percent int not null check (discount_percent between 1 and 100),
  plan_key text references public.premium_plans (key),
  max_redemptions int,
  redeemed_count int not null default 0,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

-- Écritures uniquement via les fonctions definer ci-dessous.
create policy "coupons_select_admin"
  on public.coupons for select to authenticated
  using (public.is_admin());

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- A4 — Modération
-- ────────────────────────────────────────────────────────────────────

-- File des signalements : { total, counts, items }.
create or replace function public.admin_list_reports(
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
    select r.*,
      rep.first_name as reporter_name, rep.avatar_url as reporter_avatar,
      tgt.first_name as reported_name, tgt.last_name as reported_last,
      tgt.avatar_url as reported_avatar, tgt.account_status as reported_status,
      tgt.email as reported_email
    from public.reports r
    left join public.profiles rep on rep.id = r.reporter_id
    left join public.profiles tgt on tgt.id = r.reported_id
    where (p_status is null or r.status = p_status)
      and (
        p_query is null or p_query = '' or
        r.reason ilike '%' || p_query || '%' or
        tgt.first_name ilike '%' || p_query || '%' or
        tgt.email ilike '%' || p_query || '%'
      )
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'counts', (
      select coalesce(jsonb_object_agg(s.status, s.cnt), '{}'::jsonb) from (
        select status, count(*) as cnt from public.reports group by status
      ) s
    ),
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id,
        'reason', b.reason,
        'details', b.details,
        'status', b.status,
        'created_at', b.created_at,
        'reviewed_at', b.reviewed_at,
        'reporter', jsonb_build_object('id', b.reporter_id, 'name', b.reporter_name, 'avatar', b.reporter_avatar),
        'reported', jsonb_build_object(
          'id', b.reported_id,
          'name', nullif(concat_ws(' ', b.reported_name, b.reported_last), ''),
          'email', b.reported_email,
          'avatar', b.reported_avatar,
          'account_status', b.reported_status,
          'total_reports', (select count(*) from public.reports r2 where r2.reported_id = b.reported_id)
        )
      ) order by b.created_at desc), '[]'::jsonb)
      from (select * from base order by created_at desc limit v_limit offset v_offset) b
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_list_reports(text, text, int, int) from public, anon;
grant execute on function public.admin_list_reports(text, text, int, int) to authenticated;

-- Résolution / rejet de signalements (unitaire ou en masse).
create or replace function public.admin_review_reports(p_ids uuid[], p_status text)
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
  if p_status not in ('resolved', 'dismissed', 'pending') then
    raise exception 'invalid status %', p_status;
  end if;

  update public.reports set
    status = p_status,
    reviewed_at = case when p_status = 'pending' then null else now() end
  where id = any (p_ids);
  get diagnostics v_count = row_count;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  select (select auth.uid()), 'report.' || p_status, 'report', r::text, '{}'::jsonb
  from unnest(p_ids) as r;

  return v_count;
end;
$$;

revoke execute on function public.admin_review_reports(uuid[], text) from public, anon;
grant execute on function public.admin_review_reports(uuid[], text) to authenticated;

-- Avertissement adressé à un membre.
create or replace function public.admin_warn_user(p_user_id uuid, p_message text)
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
  if nullif(trim(coalesce(p_message, '')), '') is null then
    raise exception 'warning message required';
  end if;

  insert into public.admin_warnings (profile_id, admin_id, message)
  values (p_user_id, (select auth.uid()), p_message);

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.warn', 'user', p_user_id::text,
          jsonb_build_object('message', p_message));
end;
$$;

revoke execute on function public.admin_warn_user(uuid, text) from public, anon;
grant execute on function public.admin_warn_user(uuid, text) to authenticated;

-- Bannissement temporaire : suspend le compte avec une échéance.
create or replace function public.admin_temp_ban(p_user_id uuid, p_days int, p_reason text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_days int := least(greatest(coalesce(p_days, 1), 1), 3650);
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if exists (select 1 from public.admin_users au where au.user_id = p_user_id and au.is_active) then
    raise exception 'cannot moderate a back-office account' using errcode = '42501';
  end if;

  update public.profiles set
    account_status = 'suspended',
    status_reason = p_reason,
    suspended_until = now() + make_interval(days => v_days),
    status_changed_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'user.temp_ban', 'user', p_user_id::text,
          jsonb_build_object('days', v_days, 'reason', p_reason));
end;
$$;

revoke execute on function public.admin_temp_ban(uuid, int, text) from public, anon;
grant execute on function public.admin_temp_ban(uuid, int, text) to authenticated;

create or replace function public.admin_moderation_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 2 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'reports_pending', (select count(*) from public.reports where status = 'pending'),
    'reports_total', (select count(*) from public.reports),
    'warnings_total', (select count(*) from public.admin_warnings),
    'suspended_users', (select count(*) from public.profiles where account_status = 'suspended'),
    'banned_users', (select count(*) from public.profiles where account_status = 'banned')
  );
end;
$$;

revoke execute on function public.admin_moderation_stats() from public, anon;
grant execute on function public.admin_moderation_stats() to authenticated;

-- ────────────────────────────────────────────────────────────────────
-- A5 — Premium
-- ────────────────────────────────────────────────────────────────────

create or replace function public.admin_list_subscriptions(
  p_status text default null,
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
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with base as (
    select s.*, pp.label as plan_label, pp.price_cents, pp.currency,
      p.first_name, p.last_name, p.email, p.avatar_url
    from public.subscriptions s
    join public.premium_plans pp on pp.key = s.plan_key
    join public.profiles p on p.id = s.profile_id
    where (p_status is null or s.status = p_status)
      and (
        p_query is null or p_query = '' or
        p.first_name ilike '%' || p_query || '%' or
        p.email ilike '%' || p_query || '%'
      )
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'counts', (
      select coalesce(jsonb_object_agg(s.status, s.cnt), '{}'::jsonb) from (
        select status, count(*) as cnt from public.subscriptions group by status
      ) s
    ),
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id,
        'profile', jsonb_build_object(
          'id', b.profile_id,
          'name', nullif(concat_ws(' ', b.first_name, b.last_name), ''),
          'email', b.email, 'avatar', b.avatar_url
        ),
        'plan_key', b.plan_key,
        'plan_label', b.plan_label,
        'price_cents', b.price_cents,
        'currency', b.currency,
        'status', b.status,
        'provider', b.provider,
        'starts_at', b.starts_at,
        'expires_at', b.expires_at,
        'created_at', b.created_at
      ) order by b.created_at desc), '[]'::jsonb)
      from (select * from base order by created_at desc limit v_limit offset v_offset) b
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_list_subscriptions(text, text, int, int) from public, anon;
grant execute on function public.admin_list_subscriptions(text, text, int, int) to authenticated;

create or replace function public.admin_premium_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'active', (select count(*) from public.subscriptions where status = 'active' and (expires_at is null or expires_at > now())),
    'expired', (select count(*) from public.subscriptions where status = 'expired'),
    'canceled', (select count(*) from public.subscriptions where status = 'canceled'),
    'revenue_total_cents', (
      select coalesce(sum(pp.price_cents), 0)
      from public.subscriptions s join public.premium_plans pp on pp.key = s.plan_key
      where s.status in ('active', 'expired')
    ),
    'mrr_cents', (
      -- Revenu normalisé sur 30 jours des abonnements actifs.
      select coalesce(round(sum(pp.price_cents::numeric * 30 / nullif(pp.duration_days, 0))), 0)
      from public.subscriptions s join public.premium_plans pp on pp.key = s.plan_key
      where s.status = 'active' and (s.expires_at is null or s.expires_at > now())
    ),
    'by_plan', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'plan_key', pp.key, 'label', pp.label, 'price_cents', pp.price_cents,
        'active_count', (
          select count(*) from public.subscriptions s
          where s.plan_key = pp.key and s.status = 'active' and (s.expires_at is null or s.expires_at > now())
        )
      ) order by pp.sort_order), '[]'::jsonb)
      from public.premium_plans pp
    )
  );
end;
$$;

revoke execute on function public.admin_premium_stats() from public, anon;
grant execute on function public.admin_premium_stats() to authenticated;

-- Octroi manuel d'un abonnement (upgrade) — provider 'admin'.
create or replace function public.admin_grant_subscription(p_user_id uuid, p_plan_key text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  v_id := public.grant_subscription(p_user_id, p_plan_key, 'admin', 'manual-upgrade');

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'subscription.grant', 'user', p_user_id::text,
          jsonb_build_object('plan_key', p_plan_key, 'subscription_id', v_id));

  return v_id;
end;
$$;

revoke execute on function public.admin_grant_subscription(uuid, text) from public, anon;
grant execute on function public.admin_grant_subscription(uuid, text) to authenticated;

-- Annulation / remboursement (downgrade) d'un abonnement.
create or replace function public.admin_cancel_subscription(p_subscription_id uuid, p_refund boolean default false)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_profile uuid;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  update public.subscriptions set
    status = 'canceled',
    expires_at = case when p_refund then now() else expires_at end
  where id = p_subscription_id
  returning profile_id into v_profile;

  if v_profile is null then
    raise exception 'subscription not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()),
          case when p_refund then 'subscription.refund' else 'subscription.cancel' end,
          'subscription', p_subscription_id::text,
          jsonb_build_object('refund', p_refund, 'profile_id', v_profile));
end;
$$;

revoke execute on function public.admin_cancel_subscription(uuid, boolean) from public, anon;
grant execute on function public.admin_cancel_subscription(uuid, boolean) to authenticated;

-- Création / mise à jour d'un plan (whitelist de champs).
create or replace function public.admin_upsert_plan(p_key text, p_patch jsonb)
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

  insert into public.premium_plans (key, label, price_cents, currency, duration_days, description, is_active, sort_order)
  values (
    p_key,
    coalesce(p_patch ->> 'label', p_key),
    coalesce((p_patch ->> 'price_cents')::int, 0),
    coalesce(p_patch ->> 'currency', 'EUR'),
    coalesce((p_patch ->> 'duration_days')::int, 30),
    p_patch ->> 'description',
    coalesce((p_patch ->> 'is_active')::boolean, true),
    coalesce((p_patch ->> 'sort_order')::int, 99)
  )
  on conflict (key) do update set
    label = case when p_patch ? 'label' then excluded.label else public.premium_plans.label end,
    price_cents = case when p_patch ? 'price_cents' then excluded.price_cents else public.premium_plans.price_cents end,
    currency = case when p_patch ? 'currency' then excluded.currency else public.premium_plans.currency end,
    duration_days = case when p_patch ? 'duration_days' then excluded.duration_days else public.premium_plans.duration_days end,
    description = case when p_patch ? 'description' then excluded.description else public.premium_plans.description end,
    is_active = case when p_patch ? 'is_active' then excluded.is_active else public.premium_plans.is_active end,
    sort_order = case when p_patch ? 'sort_order' then excluded.sort_order else public.premium_plans.sort_order end;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'plan.upsert', 'plan', p_key, p_patch);
end;
$$;

revoke execute on function public.admin_upsert_plan(text, jsonb) from public, anon;
grant execute on function public.admin_upsert_plan(text, jsonb) to authenticated;

-- Coupons : liste, création/mise à jour, suppression.
create or replace function public.admin_list_coupons()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
    from public.coupons c
  );
end;
$$;

revoke execute on function public.admin_list_coupons() from public, anon;
grant execute on function public.admin_list_coupons() to authenticated;

create or replace function public.admin_upsert_coupon(p_code text, p_patch jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text := upper(trim(p_code));
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if v_code is null or v_code = '' then
    raise exception 'coupon code required';
  end if;

  insert into public.coupons (code, description, discount_percent, plan_key, max_redemptions, valid_until, is_active)
  values (
    v_code,
    p_patch ->> 'description',
    coalesce((p_patch ->> 'discount_percent')::int, 10),
    nullif(p_patch ->> 'plan_key', ''),
    nullif(p_patch ->> 'max_redemptions', '')::int,
    nullif(p_patch ->> 'valid_until', '')::timestamptz,
    coalesce((p_patch ->> 'is_active')::boolean, true)
  )
  on conflict (code) do update set
    description = case when p_patch ? 'description' then excluded.description else public.coupons.description end,
    discount_percent = case when p_patch ? 'discount_percent' then excluded.discount_percent else public.coupons.discount_percent end,
    plan_key = case when p_patch ? 'plan_key' then excluded.plan_key else public.coupons.plan_key end,
    max_redemptions = case when p_patch ? 'max_redemptions' then excluded.max_redemptions else public.coupons.max_redemptions end,
    valid_until = case when p_patch ? 'valid_until' then excluded.valid_until else public.coupons.valid_until end,
    is_active = case when p_patch ? 'is_active' then excluded.is_active else public.coupons.is_active end;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'coupon.upsert', 'coupon', v_code, p_patch);
end;
$$;

revoke execute on function public.admin_upsert_coupon(text, jsonb) from public, anon;
grant execute on function public.admin_upsert_coupon(text, jsonb) to authenticated;

create or replace function public.admin_delete_coupon(p_code text)
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

  delete from public.coupons where code = upper(trim(p_code));

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'coupon.delete', 'coupon', upper(trim(p_code)), '{}'::jsonb);
end;
$$;

revoke execute on function public.admin_delete_coupon(text) from public, anon;
grant execute on function public.admin_delete_coupon(text) to authenticated;
