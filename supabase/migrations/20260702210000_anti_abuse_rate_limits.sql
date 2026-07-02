-- Sprint 5 — anti-abuse rate limits enforced in the database, where a bot
-- with a stolen JWT can't bypass them. Likes are already capped by
-- enforce_swipe_limits; this covers message flooding and report spam.

create or replace function public.enforce_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_minute int;
begin
  select count(*) into v_last_minute
    from public.messages
    where sender_id = new.sender_id
      and created_at > now() - interval '1 minute';
  if v_last_minute >= 30 then
    raise exception 'MESSAGE_RATE_LIMITED';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_message_rate_limit() from public, anon, authenticated;

create trigger before_message_rate_limit
  before insert on public.messages
  for each row execute function public.enforce_message_rate_limit();

create or replace function public.enforce_report_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today int;
begin
  select count(*) into v_today
    from public.reports
    where reporter_id = new.reporter_id
      and created_at >= date_trunc('day', now());
  if v_today >= 10 then
    raise exception 'REPORT_RATE_LIMITED';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_report_rate_limit() from public, anon, authenticated;

create trigger before_report_rate_limit
  before insert on public.reports
  for each row execute function public.enforce_report_rate_limit();
