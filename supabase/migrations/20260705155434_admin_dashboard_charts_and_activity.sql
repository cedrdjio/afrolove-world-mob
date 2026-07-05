-- Sprint A1 — données du dashboard admin : séries temporelles (croissance,
-- revenus, actifs, matchs, messages, abonnements), répartitions pays/genre,
-- et flux d'activité récente. SECURITY DEFINER gated is_admin(), revoke anon.

create or replace function public.admin_dashboard_charts(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
  v_days int := least(greatest(coalesce(p_days, 30), 7), 365);
  v_start timestamptz := date_trunc('day', now()) - make_interval(days => v_days - 1);
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  with days as (
    select d::date as day
    from generate_series(v_start, date_trunc('day', now()), interval '1 day') as d
  ),
  baseline as (
    select count(*) as cnt from public.profiles where created_at < v_start
  ),
  daily_profiles as (
    select created_at::date as day, count(*) as cnt
    from public.profiles where created_at >= v_start group by 1
  ),
  daily_revenue as (
    select s.created_at::date as day, sum(pp.price_cents) as cents
    from public.subscriptions s
    join public.premium_plans pp on pp.key = s.plan_key
    where s.created_at >= v_start group by 1
  ),
  daily_subs as (
    select created_at::date as day, count(*) as cnt
    from public.subscriptions where created_at >= v_start group by 1
  ),
  daily_matches as (
    select created_at::date as day, count(*) as cnt
    from public.matches where created_at >= v_start group by 1
  ),
  daily_messages as (
    select created_at::date as day, count(*) as cnt
    from public.messages where created_at >= v_start group by 1
  ),
  daily_active as (
    select activity.day, count(distinct activity.profile_id) as cnt from (
      select created_at::date as day, sender_id as profile_id
        from public.messages where created_at >= v_start
      union all
      select created_at::date, swiper_id
        from public.swipes where created_at >= v_start
      union all
      select last_active_at::date, id
        from public.profiles where last_active_at >= v_start
    ) activity group by 1
  ),
  merged as (
    select days.day,
      coalesce(dp.cnt, 0)    as new_users,
      coalesce(dr.cents, 0)  as revenue_cents,
      coalesce(da.cnt, 0)    as active_users,
      coalesce(dm.cnt, 0)    as matches,
      coalesce(dms.cnt, 0)   as messages,
      coalesce(ds.cnt, 0)    as subscriptions
    from days
    left join daily_profiles dp on dp.day = days.day
    left join daily_revenue  dr on dr.day = days.day
    left join daily_active   da on da.day = days.day
    left join daily_matches  dm on dm.day = days.day
    left join daily_messages dms on dms.day = days.day
    left join daily_subs     ds on ds.day = days.day
  ),
  cumulated as (
    select m.*,
      (select b.cnt from baseline b) + sum(m.new_users) over (order by m.day) as total_users
    from merged m
  )
  select jsonb_build_object(
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(c.day, 'YYYY-MM-DD'),
        'new_users', c.new_users,
        'total_users', c.total_users,
        'revenue_cents', c.revenue_cents,
        'active_users', c.active_users,
        'matches', c.matches,
        'messages', c.messages,
        'subscriptions', c.subscriptions
      ) order by c.day), '[]'::jsonb)
      from cumulated c
    ),
    'countries', (
      select coalesce(jsonb_agg(to_jsonb(t) order by t.count desc), '[]'::jsonb) from (
        select p.country, count(*)::int as count
        from public.profiles p group by p.country
        order by count(*) desc limit 8
      ) t
    ),
    'genders', (
      select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) from (
        select p.gender, count(*)::int as count
        from public.profiles p group by p.gender
      ) g
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_dashboard_charts(int) from public, anon;
grant execute on function public.admin_dashboard_charts(int) to authenticated;

-- Flux unifié des derniers événements de la plateforme.
create or replace function public.admin_recent_activity(p_limit int default 20)
returns table (kind text, label text, detail text, happened_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select * from (
    (
      select 'signup'::text as kind,
        coalesce(p.first_name, split_part(coalesce(p.email, ''), '@', 1)) as label,
        nullif(concat_ws(' · ', p.city, p.country), '') as detail,
        p.created_at as happened_at
      from public.profiles p
      order by p.created_at desc limit 50
    )
    union all
    (
      select 'match',
        concat(coalesce(pa.first_name, '?'), ' & ', coalesce(pb.first_name, '?')),
        null::text,
        m.created_at
      from public.matches m
      join public.profiles pa on pa.id = m.profile_a
      join public.profiles pb on pb.id = m.profile_b
      order by m.created_at desc limit 50
    )
    union all
    (
      select 'kyc',
        coalesce(p.first_name, 'Membre'),
        k.status,
        k.submitted_at
      from public.kyc_submissions k
      join public.profiles p on p.id = k.profile_id
      order by k.submitted_at desc limit 50
    )
    union all
    (
      select 'report',
        r.reason,
        r.status,
        r.created_at
      from public.reports r
      order by r.created_at desc limit 50
    )
    union all
    (
      select 'subscription',
        concat(coalesce(p.first_name, 'Membre'), ' · ', pp.label),
        s.status,
        s.created_at
      from public.subscriptions s
      join public.profiles p on p.id = s.profile_id
      join public.premium_plans pp on pp.key = s.plan_key
      order by s.created_at desc limit 50
    )
  ) events
  order by events.happened_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

revoke execute on function public.admin_recent_activity(int) from public, anon;
grant execute on function public.admin_recent_activity(int) to authenticated;
