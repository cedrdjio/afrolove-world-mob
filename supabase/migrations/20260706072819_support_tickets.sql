-- Sprint A12 — tickets de support.
-- Les membres pourront créer des tickets depuis l'app à terme ; en attendant,
-- le back-office gère la file, assigne, ajoute des notes internes et clôture.

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  subject text not null,
  category text not null default 'general',
  status text not null default 'open' check (status in ('open', 'pending', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  is_internal boolean not null default false,
  is_from_member boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create index support_tickets_status_idx on public.support_tickets (status, updated_at desc);
create index support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

create policy "support_tickets_owner" on public.support_tickets
  for select to authenticated using (profile_id = (select auth.uid()));
create policy "support_tickets_admin" on public.support_tickets
  for select to authenticated using (public.is_admin());
create policy "support_messages_admin" on public.support_messages
  for select to authenticated using (public.is_admin());
create policy "support_messages_owner" on public.support_messages
  for select to authenticated
  using (not is_internal and exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and t.profile_id = (select auth.uid())
  ));

create trigger support_tickets_set_updated_at
  before update on public.support_tickets
  for each row execute function public.handle_updated_at();

-- Seed : quelques tickets réels d'exemple rattachés à des membres existants.
do $$
declare
  p1 uuid; p2 uuid; p3 uuid; t1 uuid; t2 uuid; t3 uuid;
begin
  select id into p1 from public.profiles order by created_at limit 1;
  select id into p2 from public.profiles order by created_at offset 1 limit 1;
  select id into p3 from public.profiles order by created_at offset 2 limit 1;

  insert into public.support_tickets (profile_id, subject, category, status, priority, created_at)
  values (p1, 'Impossible de téléverser ma photo', 'technical', 'open', 'high', now() - interval '3 hours')
  returning id into t1;
  insert into public.support_messages (ticket_id, author_id, is_from_member, body, created_at) values
    (t1, p1, true, 'Bonjour, quand j''ajoute une photo l''application plante à chaque fois. Pouvez-vous m''aider ?', now() - interval '3 hours');

  insert into public.support_tickets (profile_id, subject, category, status, priority, created_at)
  values (p2, 'Remboursement abonnement premium', 'billing', 'pending', 'normal', now() - interval '1 day')
  returning id into t2;
  insert into public.support_messages (ticket_id, author_id, is_from_member, body, created_at) values
    (t2, p2, true, 'J''ai été débité deux fois pour mon abonnement, merci de vérifier.', now() - interval '1 day'),
    (t2, null, false, 'Bonjour, nous vérifions auprès du prestataire de paiement et revenons vers vous.', now() - interval '20 hours');

  insert into public.support_tickets (profile_id, subject, category, status, priority, created_at)
  values (p3, 'Signaler un comportement inapproprié', 'safety', 'closed', 'high', now() - interval '4 days')
  returning id into t3;
  insert into public.support_messages (ticket_id, author_id, is_from_member, body, created_at) values
    (t3, p3, true, 'Un membre m''a envoyé des messages déplacés.', now() - interval '4 days'),
    (t3, null, true, 'Note interne : profil suspendu après vérification.', now() - interval '3 days');
end $$;

create or replace function public.admin_list_tickets(
  p_status text default 'open', p_query text default null,
  p_limit int default 25, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if public.admin_role_level() < 1 then raise exception 'admin access required' using errcode = '42501'; end if;
  with base as (
    select t.*, p.first_name, p.last_name, p.email, p.avatar_url,
      au.display_name as assignee_name,
      (select count(*) from public.support_messages m where m.ticket_id = t.id) as message_count
    from public.support_tickets t
    left join public.profiles p on p.id = t.profile_id
    left join public.admin_users au on au.user_id = t.assigned_to
    where (p_status is null or p_status = '' or t.status = p_status)
      and (p_query is null or p_query = '' or t.subject ilike '%' || p_query || '%'
           or p.first_name ilike '%' || p_query || '%' or p.email ilike '%' || p_query || '%')
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'counts', (select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
               from (select status, count(*) as cnt from public.support_tickets group by status) s),
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'subject', b.subject, 'category', b.category, 'status', b.status,
        'priority', b.priority, 'created_at', b.created_at, 'updated_at', b.updated_at,
        'message_count', b.message_count, 'assignee_name', b.assignee_name, 'assigned_to', b.assigned_to,
        'member', jsonb_build_object('id', b.profile_id,
          'name', nullif(concat_ws(' ', b.first_name, b.last_name), ''),
          'email', b.email, 'avatar', b.avatar_url)
      ) order by b.updated_at desc), '[]'::jsonb)
      from (select * from base order by updated_at desc limit v_limit offset v_offset) b
    )
  ) into result;
  return result;
end; $$;
revoke execute on function public.admin_list_tickets(text, text, int, int) from public, anon;
grant execute on function public.admin_list_tickets(text, text, int, int) to authenticated;

create or replace function public.admin_get_ticket(p_ticket_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if public.admin_role_level() < 1 then raise exception 'admin access required' using errcode = '42501'; end if;
  select jsonb_build_object(
    'ticket', jsonb_build_object(
      'id', t.id, 'subject', t.subject, 'category', t.category, 'status', t.status,
      'priority', t.priority, 'created_at', t.created_at, 'updated_at', t.updated_at,
      'assigned_to', t.assigned_to,
      'assignee_name', (select au.display_name from public.admin_users au where au.user_id = t.assigned_to),
      'member', jsonb_build_object('id', p.id,
        'name', nullif(concat_ws(' ', p.first_name, p.last_name), ''),
        'email', p.email, 'avatar', p.avatar_url)
    ),
    'messages', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', m.id, 'body', m.body, 'is_internal', m.is_internal,
        'is_from_member', m.is_from_member, 'created_at', m.created_at,
        'author_name', case when m.is_from_member then coalesce(p.first_name, 'Membre')
                            else coalesce((select au.display_name from public.admin_users au where au.user_id = m.author_id), 'Équipe') end
      ) order by m.created_at), '[]'::jsonb)
      from public.support_messages m where m.ticket_id = t.id
    )
  ) into result
  from public.support_tickets t
  left join public.profiles p on p.id = t.profile_id
  where t.id = p_ticket_id;
  if result is null then raise exception 'ticket not found' using errcode = 'P0002'; end if;
  return result;
end; $$;
revoke execute on function public.admin_get_ticket(uuid) from public, anon;
grant execute on function public.admin_get_ticket(uuid) to authenticated;

create or replace function public.admin_reply_ticket(p_ticket_id uuid, p_body text, p_internal boolean default false)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 1 then raise exception 'admin access required' using errcode = '42501'; end if;
  if nullif(trim(coalesce(p_body, '')), '') is null then raise exception 'message required'; end if;
  insert into public.support_messages (ticket_id, author_id, is_internal, is_from_member, body)
  values (p_ticket_id, (select auth.uid()), p_internal, false, p_body);
  update public.support_tickets
  set status = case when status = 'closed' then 'open' else status end, updated_at = now()
  where id = p_ticket_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), case when p_internal then 'ticket.note' else 'ticket.reply' end, 'ticket', p_ticket_id::text, '{}'::jsonb);
end; $$;
revoke execute on function public.admin_reply_ticket(uuid, text, boolean) from public, anon;
grant execute on function public.admin_reply_ticket(uuid, text, boolean) to authenticated;

create or replace function public.admin_update_ticket(p_ticket_id uuid, p_patch jsonb)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 1 then raise exception 'admin access required' using errcode = '42501'; end if;
  update public.support_tickets set
    status = case when p_patch ? 'status' then p_patch ->> 'status' else status end,
    priority = case when p_patch ? 'priority' then p_patch ->> 'priority' else priority end,
    assigned_to = case when p_patch ? 'assigned_to' then nullif(p_patch ->> 'assigned_to', '')::uuid else assigned_to end,
    updated_at = now()
  where id = p_ticket_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'ticket.update', 'ticket', p_ticket_id::text, p_patch);
end; $$;
revoke execute on function public.admin_update_ticket(uuid, jsonb) from public, anon;
grant execute on function public.admin_update_ticket(uuid, jsonb) to authenticated;
