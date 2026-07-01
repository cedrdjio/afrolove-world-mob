-- Lock down search_path and revoke public EXECUTE on the trigger function
-- (it should only ever run via the auth.users trigger, not be callable directly).
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;
