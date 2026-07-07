-- Admin roles & dashboard foundation (Sprint A0 — admin dashboard).
-- admin_users maps auth users to back-office roles; rows are managed by
-- the service role only until the RBAC UI lands (Sprint A10).

create type public.admin_role as enum
  ('super_admin', 'admin', 'moderator', 'support', 'viewer');

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'viewer',
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- The dashboard resolves the caller's role right after login; nobody can
-- see other admins' rows and no client-side writes are allowed.
create policy "admin_users_select_own"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.handle_updated_at();

-- True when the caller is an active back-office member.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and is_active
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- KPI snapshot for the admin home dashboard. SECURITY DEFINER because it
-- aggregates across RLS-protected tables; gated on is_admin() and never
-- executable by anon.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'online_users', (select count(*) from public.profiles
      where last_active_at > now() - interval '5 minutes'),
    'new_users_today', (select count(*) from public.profiles
      where created_at >= date_trunc('day', now())),
    'active_subscriptions', (select count(*) from public.subscriptions
      where status = 'active' and (expires_at is null or expires_at > now())),
    'revenue_cents', (select coalesce(sum(pp.price_cents), 0)
      from public.subscriptions s
      join public.premium_plans pp on pp.key = s.plan_key
      where s.status = 'active' and (s.expires_at is null or s.expires_at > now())),
    'matches_today', (select count(*) from public.matches
      where created_at >= date_trunc('day', now())),
    'messages_today', (select count(*) from public.messages
      where created_at >= date_trunc('day', now())),
    'reports_pending', (select count(*) from public.reports
      where status = 'pending'),
    'kyc_pending', (select count(*) from public.kyc_submissions
      where status = 'pending'),
    'registrations_14d', (
      select coalesce(
        jsonb_agg(jsonb_build_object('day', to_char(d.day, 'YYYY-MM-DD'),
                                     'count', coalesce(r.cnt, 0)) order by d.day),
        '[]'::jsonb)
      from generate_series(date_trunc('day', now()) - interval '13 days',
                           date_trunc('day', now()), interval '1 day') as d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*) as cnt
        from public.profiles
        where created_at >= date_trunc('day', now()) - interval '13 days'
        group by 1
      ) r on r.day = d.day
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
