-- Sprint 3 — push notifications. Devices register their Expo Push token;
-- every in-app notification row (created by the Sprint 2 triggers) is also
-- fanned out to the recipient's devices through Expo's push API via pg_net
-- (async HTTP from the database — no cron, no webhook configuration).

create extension if not exists pg_net with schema extensions;

create table public.push_tokens (
  token text primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  platform text check (platform in ('ios', 'android', 'web')),
  updated_at timestamptz not null default now()
);

create index push_tokens_profile_idx on public.push_tokens (profile_id);

alter table public.push_tokens enable row level security;

-- A device may re-register the same token after a reinstall under a new
-- account, so upserts must be able to steal the row — hence FOR ALL.
create policy "Members manage their own push tokens"
  on public.push_tokens for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create or replace function public.send_push_on_notification()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  device record;
begin
  for device in
    select token from public.push_tokens where profile_id = new.profile_id
  loop
    -- net.http_post queues the request asynchronously; a push failure can
    -- never fail or slow down the transaction that created the event.
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'to', device.token,
        'title', new.title,
        'body', coalesce(new.body, ''),
        'data', new.data || jsonb_build_object('type', new.type),
        'sound', 'default',
        'priority', 'high'
      )
    );
  end loop;
  return null;
end;
$$;

revoke execute on function public.send_push_on_notification() from public, anon, authenticated;

create trigger after_notification_send_push
  after insert on public.notifications
  for each row execute function public.send_push_on_notification();
