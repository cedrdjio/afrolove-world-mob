-- Sprint A8 — analytique avancée (lecture seule, agrégée côté SQL).
-- DAU/MAU, rétention, conversion, revenus, croissance, tops et heatmap.
create or replace function public.admin_analytics(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days int := least(greatest(coalesce(p_days, 30), 7), 365);
  v_start timestamptz := date_trunc('day', now()) - make_interval(days => v_days - 1);
begin
  if public.admin_role_level() < 0 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'dau', (select count(distinct id) from public.profiles
            where last_active_at >= date_trunc('day', now())),
    'mau', (select count(distinct id) from public.profiles
            where last_active_at >= now() - interval '30 days'),
    'total_users', (select count(*) from public.profiles),
    'new_users', (select count(*) from public.profiles where created_at >= v_start),
    'verified_users', (select count(*) from public.profiles where is_verified),
    'premium_users', (select count(distinct profile_id) from public.subscriptions
                      where status = 'active' and (expires_at is null or expires_at > now())),
    'conversion_rate', (
      select case when count(*) = 0 then 0
        else round(100.0 * count(*) filter (where exists (
          select 1 from public.subscriptions s
          where s.profile_id = p.id and s.status = 'active'
            and (s.expires_at is null or s.expires_at > now())
        )) / count(*), 1) end
      from public.profiles p
    ),
    'retention_7d', (
      select case when count(*) = 0 then 0
        else round(100.0 * count(*) filter (where last_active_at >= now() - interval '7 days') / count(*), 1) end
      from public.profiles where created_at < now() - interval '7 days'
    ),
    'revenue_period_cents', (
      select coalesce(sum(pp.price_cents), 0)
      from public.subscriptions s join public.premium_plans pp on pp.key = s.plan_key
      where s.created_at >= v_start
    ),
    'top_countries', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select country as label, count(*)::int as count from public.profiles
        where country is not null group by country order by count(*) desc limit 6
      ) t
    ),
    'top_cities', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select city as label, count(*)::int as count from public.profiles
        where city is not null group by city order by count(*) desc limit 6
      ) t
    ),
    'top_interests', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select i.label, count(*)::int as count
        from public.profile_interests pi join public.interests i on i.id = pi.interest_id
        group by i.label order by count(*) desc limit 8
      ) t
    ),
    'most_active_users', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select p.id, coalesce(p.first_name, split_part(coalesce(p.email,''),'@',1)) as name,
               p.avatar_url,
               (select count(*) from public.messages m where m.sender_id = p.id) +
               (select count(*) from public.swipes sw where sw.swiper_id = p.id) as activity
        from public.profiles p
        order by activity desc limit 8
      ) t
    ),
    'heatmap', (
      select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'hour', hour, 'count', cnt)), '[]'::jsonb)
      from (
        select extract(dow from created_at)::int as dow,
               extract(hour from created_at)::int as hour,
               count(*)::int as cnt
        from (
          select created_at from public.messages where created_at >= v_start
          union all
          select created_at from public.swipes where created_at >= v_start
        ) act
        group by 1, 2
      ) h
    )
  );
end;
$$;

revoke execute on function public.admin_analytics(int) from public, anon;
grant execute on function public.admin_analytics(int) to authenticated;
