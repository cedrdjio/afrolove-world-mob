-- Sprint 2 — in-app notifications. Rows are created exclusively by triggers
-- (definer) on the events that matter: new match, new message, (super) like
-- received, KYC review outcome. Clients read their own rows and mark them
-- read; Realtime streams new ones for the live bell badge.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('match', 'message', 'like', 'kyc')),
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (profile_id, created_at desc);
create index notifications_unread_idx on public.notifications (profile_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "Members read their own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = profile_id);
-- Marking read is the only client-side write.
create policy "Members mark their own notifications read"
  on public.notifications for update to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- Trigger: new match → notify both members
-- ============================================================
create or replace function public.notify_on_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name_a text;
  name_b text;
begin
  select coalesce(first_name, 'Un membre') into name_a from public.profiles where id = new.profile_a;
  select coalesce(first_name, 'Un membre') into name_b from public.profiles where id = new.profile_b;

  insert into public.notifications (profile_id, type, title, body, data) values
    (new.profile_a, 'match', 'Nouveau match !', 'Vous avez matché avec ' || name_b || ' 🎉',
     jsonb_build_object('match_id', new.id, 'partner_id', new.profile_b)),
    (new.profile_b, 'match', 'Nouveau match !', 'Vous avez matché avec ' || name_a || ' 🎉',
     jsonb_build_object('match_id', new.id, 'partner_id', new.profile_a));
  return null;
end;
$$;

revoke execute on function public.notify_on_match() from public, anon, authenticated;

create trigger after_match_notify
  after insert on public.matches
  for each row execute function public.notify_on_match();

-- ============================================================
-- Trigger: new message → notify the recipient (collapsed: at most one
-- unread "message" notification per conversation, or it becomes spam)
-- ============================================================
create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
  sender_name text;
begin
  select case when m.profile_a = new.sender_id then m.profile_b else m.profile_a end
    into recipient
    from public.matches m where m.id = new.match_id;
  if recipient is null then return null; end if;

  if exists (
    select 1 from public.notifications
    where profile_id = recipient
      and type = 'message'
      and read_at is null
      and (data ->> 'match_id')::uuid = new.match_id
  ) then
    return null;
  end if;

  select coalesce(first_name, 'Un membre') into sender_name from public.profiles where id = new.sender_id;

  insert into public.notifications (profile_id, type, title, body, data)
  values (
    recipient, 'message', 'Nouveau message',
    sender_name || ' : ' || left(new.content, 80),
    jsonb_build_object('match_id', new.match_id, 'sender_id', new.sender_id)
  );
  return null;
end;
$$;

revoke execute on function public.notify_on_message() from public, anon, authenticated;

create trigger after_message_notify
  after insert on public.messages
  for each row execute function public.notify_on_message();

-- ============================================================
-- Trigger: like received — super likes reveal the name, plain likes stay
-- anonymous (that reveal is the premium "see who liked you" feature)
-- ============================================================
create or replace function public.notify_on_swipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  swiper_name text;
begin
  if new.action = 'super_like' then
    select coalesce(first_name, 'Un membre') into swiper_name from public.profiles where id = new.swiper_id;
    insert into public.notifications (profile_id, type, title, body, data)
    values (new.target_id, 'like', 'Super Like reçu ⭐', swiper_name || ' vous a super-liké !',
            jsonb_build_object('swiper_id', new.swiper_id));
  elsif new.action = 'like' then
    insert into public.notifications (profile_id, type, title, body, data)
    values (new.target_id, 'like', 'Nouveau like', 'Quelqu''un a aimé votre profil 💛', '{}'::jsonb);
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_on_swipe() from public, anon, authenticated;

create trigger after_swipe_notify
  after insert on public.swipes
  for each row execute function public.notify_on_swipe();

-- ============================================================
-- Trigger: KYC review outcome
-- ============================================================
create or replace function public.notify_on_kyc_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    insert into public.notifications (profile_id, type, title, body, data)
    values (new.profile_id, 'kyc', 'Profil vérifié ✓', 'Votre badge vérifié est maintenant actif.',
            jsonb_build_object('submission_id', new.id));
  elsif new.status = 'rejected' and old.status is distinct from new.status then
    insert into public.notifications (profile_id, type, title, body, data)
    values (new.profile_id, 'kyc', 'Vérification refusée',
            coalesce(new.rejection_reason, 'Consultez votre dossier pour plus de détails.'),
            jsonb_build_object('submission_id', new.id));
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_on_kyc_review() from public, anon, authenticated;

create trigger after_kyc_review_notify
  after update of status on public.kyc_submissions
  for each row execute function public.notify_on_kyc_review();
