-- Sprint A7 — notifications diffusées (broadcast) depuis le back-office.
-- Un broadcast cible une audience (tous / pays / genre / premium / âge),
-- soit immédiatement (insère une notification par membre concerné), soit
-- programmé pour plus tard. L'historique et les envois programmés vivent
-- dans admin_broadcasts.

create table public.admin_broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience jsonb not null default '{"type":"all"}'::jsonb,
  status text not null default 'sent' check (status in ('sent', 'scheduled', 'canceled')),
  recipients_count int not null default 0,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index admin_broadcasts_created_idx on public.admin_broadcasts (created_at desc);
alter table public.admin_broadcasts enable row level security;

create policy "admin_broadcasts_select" on public.admin_broadcasts
  for select to authenticated using (public.is_admin());

-- Sélectionne les profils actifs correspondant à une audience.
-- audience = { type: 'all'|'country'|'gender'|'premium'|'age', ... }.
create or replace function public.admin_audience_profiles(p_audience jsonb)
returns table (profile_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_type text := coalesce(p_audience ->> 'type', 'all');
begin
  return query
  select p.id
  from public.profiles p
  where p.account_status = 'active'
    and case v_type
      when 'all' then true
      when 'country' then p.country = (p_audience ->> 'country')
      when 'gender' then p.gender = (p_audience ->> 'gender')
      when 'premium' then (
        (p_audience ->> 'premium')::boolean = exists (
          select 1 from public.subscriptions s
          where s.profile_id = p.id and s.status = 'active'
            and (s.expires_at is null or s.expires_at > now())
        )
      )
      when 'age' then (
        p.birth_date is not null
        and extract(year from age(p.birth_date)) >= coalesce((p_audience ->> 'age_min')::int, 18)
        and extract(year from age(p.birth_date)) <= coalesce((p_audience ->> 'age_max')::int, 120)
      )
      else false
    end;
end;
$$;

revoke execute on function public.admin_audience_profiles(jsonb) from public, anon;

-- Aperçu : nombre de destinataires pour une audience (avant envoi).
create or replace function public.admin_audience_count(p_audience jsonb)
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  select count(*) into v_count from public.admin_audience_profiles(p_audience);
  return v_count;
end;
$$;

revoke execute on function public.admin_audience_count(jsonb) from public, anon;
grant execute on function public.admin_audience_count(jsonb) to authenticated;

-- Envoi immédiat ou programmation d'un broadcast.
create or replace function public.admin_send_notification(
  p_title text,
  p_body text,
  p_audience jsonb default '{"type":"all"}'::jsonb,
  p_scheduled_for timestamptz default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count int;
  v_broadcast_id uuid;
  v_scheduled boolean := p_scheduled_for is not null and p_scheduled_for > now();
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(p_title, '')), '') is null
     or nullif(trim(coalesce(p_body, '')), '') is null then
    raise exception 'title and body are required';
  end if;

  select count(*) into v_count from public.admin_audience_profiles(p_audience);

  insert into public.admin_broadcasts (title, body, audience, status, recipients_count, scheduled_for, sent_at, created_by)
  values (
    p_title, p_body, p_audience,
    case when v_scheduled then 'scheduled' else 'sent' end,
    v_count,
    p_scheduled_for,
    case when v_scheduled then null else now() end,
    (select auth.uid())
  )
  returning id into v_broadcast_id;

  -- Envoi immédiat : une notification par membre ciblé.
  if not v_scheduled then
    insert into public.notifications (profile_id, type, title, body, data)
    select ap.profile_id, 'admin', p_title, p_body,
           jsonb_build_object('broadcast_id', v_broadcast_id)
    from public.admin_audience_profiles(p_audience) ap;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()),
          case when v_scheduled then 'notification.schedule' else 'notification.send' end,
          'broadcast', v_broadcast_id::text,
          jsonb_build_object('recipients', v_count, 'audience', p_audience));

  return jsonb_build_object(
    'broadcast_id', v_broadcast_id,
    'recipients', v_count,
    'scheduled', v_scheduled
  );
end;
$$;

revoke execute on function public.admin_send_notification(text, text, jsonb, timestamptz) from public, anon;
grant execute on function public.admin_send_notification(text, text, jsonb, timestamptz) to authenticated;

-- Historique des broadcasts (envoyés, programmés, annulés).
create or replace function public.admin_notification_history(p_limit int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id, 'title', b.title, 'body', b.body, 'audience', b.audience,
    'status', b.status, 'recipients_count', b.recipients_count,
    'scheduled_for', b.scheduled_for, 'sent_at', b.sent_at, 'created_at', b.created_at,
    'author', (select au.display_name from public.admin_users au where au.user_id = b.created_by)
  ) order by b.created_at desc), '[]'::jsonb) into result
  from (
    select * from public.admin_broadcasts order by created_at desc
    limit least(greatest(coalesce(p_limit, 30), 1), 100)
  ) b;

  return result;
end;
$$;

revoke execute on function public.admin_notification_history(int) from public, anon;
grant execute on function public.admin_notification_history(int) to authenticated;

-- Annulation d'un envoi programmé.
create or replace function public.admin_cancel_broadcast(p_id uuid)
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

  update public.admin_broadcasts set status = 'canceled'
  where id = p_id and status = 'scheduled';

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'notification.cancel', 'broadcast', p_id::text, '{}'::jsonb);
end;
$$;

revoke execute on function public.admin_cancel_broadcast(uuid) from public, anon;
grant execute on function public.admin_cancel_broadcast(uuid) to authenticated;
