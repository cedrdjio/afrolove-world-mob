-- Sprint 4 — premium with the full business logic in the database, payment
-- provider deliberately abstracted. Today purchases are activated by a dev
-- stub RPC (account under Google review, no real charging yet); when
-- Moneroo/Stripe/Google Play arrive, their webhook (service_role) calls the
-- same grant_subscription() core and the stub gets revoked. Nothing else
-- changes: limits, entitlements and gating all live here.

-- ============================================================
-- 1. Plan catalog — data, not code; editable from the dashboard.
-- ============================================================
create table public.premium_plans (
  key text primary key,
  label text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  duration_days int not null check (duration_days > 0),
  sort_order int not null default 0,
  is_active boolean not null default true,
  -- Filled per provider at integration time, e.g.
  -- {"moneroo": "plan_x", "stripe": "price_x", "google": "sku_x"}
  provider_product_ids jsonb not null default '{}'::jsonb
);

alter table public.premium_plans enable row level security;
create policy "Plans are readable by anyone signed in"
  on public.premium_plans for select to authenticated using (is_active);

insert into public.premium_plans (key, label, description, price_cents, duration_days, sort_order) values
  ('discovery_1d', 'Découverte Illimitée', 'Accès illimité 24h', 200, 1, 1),
  ('week_7d', '7 Jours', 'Accès illimité', 500, 7, 2),
  ('month_1m', '1 Mois', '30 jours · Accès illimité', 1500, 30, 3),
  ('quarter_3m', '3 Mois', '90 jours · Accès illimité', 2500, 90, 4),
  ('year_1y', '1 An', '365 jours · Accès illimité', 6500, 365, 5);

-- ============================================================
-- 2. Subscriptions — append-only purchase history
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null references public.premium_plans (key),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'canceled')),
  provider text not null default 'dev' check (provider in ('dev', 'moneroo', 'stripe', 'google', 'apple', 'admin')),
  provider_ref text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_active_idx on public.subscriptions (profile_id, status, expires_at desc);

alter table public.subscriptions enable row level security;

-- Members see their own purchase history; every write goes through the
-- definer functions below (or a future webhook with service_role).
create policy "Members read their own subscriptions"
  on public.subscriptions for select to authenticated
  using (auth.uid() = profile_id);

-- ============================================================
-- 3. Core activation — provider-agnostic, shared by the dev stub today
--    and the Moneroo/Stripe/Google webhooks tomorrow.
-- ============================================================
create or replace function public.has_active_premium(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where profile_id = p_profile_id and status = 'active' and expires_at > now()
  )
$$;

revoke execute on function public.has_active_premium(uuid) from public, anon;
grant execute on function public.has_active_premium(uuid) to authenticated;

create or replace function public.grant_subscription(
  p_profile_id uuid,
  p_plan_key text,
  p_provider text,
  p_provider_ref text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days int;
  v_base timestamptz;
  v_id uuid;
begin
  select duration_days into v_days from public.premium_plans where key = p_plan_key and is_active;
  if not found then
    raise exception 'UNKNOWN_PLAN';
  end if;

  -- Buying while already premium stacks on top of the current expiry.
  select greatest(now(), coalesce(max(expires_at), now()))
    into v_base
    from public.subscriptions
    where profile_id = p_profile_id and status = 'active';

  insert into public.subscriptions (profile_id, plan_key, status, provider, provider_ref, starts_at, expires_at)
  values (p_profile_id, p_plan_key, 'active', p_provider, p_provider_ref, now(), v_base + make_interval(days => v_days))
  returning id into v_id;
  return v_id;
end;
$$;

-- Only definer callers (the stub below) and service_role (future webhooks).
revoke execute on function public.grant_subscription(uuid, text, text, text) from public, anon, authenticated;

-- DEV STUB — instant fake payment. When Moneroo/Stripe go live:
--   revoke execute on function public.purchase_subscription_dev(text) from authenticated;
-- and route purchases through the payment webhook instead. Nothing else moves.
create or replace function public.purchase_subscription_dev(p_plan_key text)
returns table (subscription_id uuid, premium_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  v_id := public.grant_subscription(auth.uid(), p_plan_key, 'dev', 'dev-' || gen_random_uuid());
  return query select v_id, s.expires_at from public.subscriptions s where s.id = v_id;
end;
$$;

revoke execute on function public.purchase_subscription_dev(text) from public, anon;
grant execute on function public.purchase_subscription_dev(text) to authenticated;

-- ============================================================
-- 4. Real constraints for free accounts, enforced where they can't be
--    bypassed: free = 5 likes/day and no super likes; premium = unlimited
--    likes and 5 super likes/day.
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
  if new.action = 'pass' then return new; end if;
  if tg_op = 'UPDATE' and old.action = new.action then return new; end if;

  v_premium := public.has_active_premium(new.swiper_id);

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
    select count(*) into v_count
      from public.swipes
      where swiper_id = new.swiper_id and action <> 'pass'
        and created_at >= date_trunc('day', now());
    if v_count >= 5 then
      raise exception 'LIKE_LIMIT_REACHED';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_swipe_limits() from public, anon, authenticated;

create trigger before_swipe_enforce_limits
  before insert or update of action on public.swipes
  for each row execute function public.enforce_swipe_limits();

-- ============================================================
-- 5. Entitlements — one call tells the app everything it may show/do.
-- ============================================================
create or replace function public.get_my_entitlements()
returns table (
  is_premium boolean,
  premium_until timestamptz,
  plan_label text,
  likes_used_today int,
  likes_limit int,          -- null = unlimited
  super_likes_used_today int,
  super_likes_limit int,
  likers_count int
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
      count(*) filter (where action <> 'pass')::int as likes,
      count(*) filter (where action = 'super_like')::int as supers
    from public.swipes
    where swiper_id = auth.uid() and created_at >= date_trunc('day', now())
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
    case when exists (select 1 from prem) then null else 5 end,
    usage.supers,
    case when exists (select 1 from prem) then 5 else 0 end,
    likers.n
  from usage, likers
$$;

revoke execute on function public.get_my_entitlements() from public, anon;
grant execute on function public.get_my_entitlements() to authenticated;

-- ============================================================
-- 6. Favorites (profiles I liked) and likers (who liked me — premium)
-- ============================================================
create or replace function public.get_my_favorites()
returns table (
  profile_id uuid,
  first_name text,
  avatar_url text,
  city text,
  is_verified boolean,
  action text,
  liked_at timestamptz,
  is_matched boolean
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.first_name, p.avatar_url, p.city, p.is_verified, s.action, s.created_at,
    exists (
      select 1 from public.matches m
      where m.profile_a = least(auth.uid(), p.id) and m.profile_b = greatest(auth.uid(), p.id)
    )
  from public.swipes s
  join public.profiles p on p.id = s.target_id
  where s.swiper_id = auth.uid()
    and s.action <> 'pass'
    and p.account_status = 'active'
    and not public.is_blocked_between(auth.uid(), p.id)
  order by s.created_at desc
  limit 100
$$;

revoke execute on function public.get_my_favorites() from public, anon;
grant execute on function public.get_my_favorites() to authenticated;

-- Premium-only reveal: non-premium callers get zero rows (the teaser uses
-- likers_count from get_my_entitlements instead).
create or replace function public.get_my_likers()
returns table (
  profile_id uuid,
  first_name text,
  avatar_url text,
  city text,
  is_verified boolean,
  action text,
  liked_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.first_name, p.avatar_url, p.city, p.is_verified, s.action, s.created_at
  from public.swipes s
  join public.profiles p on p.id = s.swiper_id
  where s.target_id = auth.uid()
    and s.action <> 'pass'
    and p.account_status = 'active'
    and not public.is_blocked_between(auth.uid(), s.swiper_id)
    and not exists (
      select 1 from public.swipes r where r.swiper_id = auth.uid() and r.target_id = s.swiper_id
    )
    and public.has_active_premium(auth.uid())
  order by s.created_at desc
  limit 100
$$;

revoke execute on function public.get_my_likers() from public, anon;
grant execute on function public.get_my_likers() to authenticated;
