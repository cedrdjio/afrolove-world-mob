-- Sprint A10 (RBAC) + A11 (Audit).

create or replace function public.admin_list_admins()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 4 then raise exception 'super admin required' using errcode = '42501'; end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'user_id', au.user_id, 'role', au.role, 'display_name', au.display_name,
      'is_active', au.is_active, 'created_at', au.created_at, 'email', u.email,
      'last_sign_in_at', u.last_sign_in_at
    ) order by au.created_at), '[]'::jsonb)
    from public.admin_users au join auth.users u on u.id = au.user_id
  );
end; $$;
revoke execute on function public.admin_list_admins() from public, anon;
grant execute on function public.admin_list_admins() to authenticated;

create or replace function public.admin_grant_role(p_email text, p_role public.admin_role, p_display_name text default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_uid uuid;
begin
  if public.admin_role_level() < 4 then raise exception 'super admin required' using errcode = '42501'; end if;
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then
    raise exception 'Aucun compte avec cet e-mail. La personne doit d''abord créer un compte.' using errcode = 'P0002';
  end if;
  insert into public.admin_users (user_id, role, display_name, is_active)
  values (v_uid, p_role, coalesce(p_display_name, split_part(p_email, '@', 1)), true)
  on conflict (user_id) do update set
    role = excluded.role,
    display_name = coalesce(excluded.display_name, public.admin_users.display_name),
    is_active = true;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'admin.grant', 'admin', v_uid::text, jsonb_build_object('role', p_role, 'email', p_email));
end; $$;
revoke execute on function public.admin_grant_role(text, public.admin_role, text) from public, anon;
grant execute on function public.admin_grant_role(text, public.admin_role, text) to authenticated;

create or replace function public.admin_set_admin_active(p_user_id uuid, p_active boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 4 then raise exception 'super admin required' using errcode = '42501'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'cannot change your own access' using errcode = '42501'; end if;
  update public.admin_users set is_active = p_active where user_id = p_user_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), case when p_active then 'admin.enable' else 'admin.disable' end, 'admin', p_user_id::text, '{}'::jsonb);
end; $$;
revoke execute on function public.admin_set_admin_active(uuid, boolean) from public, anon;
grant execute on function public.admin_set_admin_active(uuid, boolean) to authenticated;

create or replace function public.admin_revoke_role(p_user_id uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 4 then raise exception 'super admin required' using errcode = '42501'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'cannot revoke your own access' using errcode = '42501'; end if;
  delete from public.admin_users where user_id = p_user_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'admin.revoke', 'admin', p_user_id::text, '{}'::jsonb);
end; $$;
revoke execute on function public.admin_revoke_role(uuid) from public, anon;
grant execute on function public.admin_revoke_role(uuid) to authenticated;

create or replace function public.admin_audit_list(
  p_query text default null, p_target_type text default null,
  p_limit int default 40, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
  v_limit int := least(greatest(coalesce(p_limit, 40), 1), 100);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  with base as (
    select al.*, au.display_name as admin_name, u.email as admin_email
    from public.admin_audit_log al
    left join public.admin_users au on au.user_id = al.admin_id
    left join auth.users u on u.id = al.admin_id
    where (p_target_type is null or p_target_type = '' or al.target_type = p_target_type)
      and (p_query is null or p_query = '' or al.action ilike '%' || p_query || '%'
           or au.display_name ilike '%' || p_query || '%')
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'action', b.action, 'target_type', b.target_type,
        'target_id', b.target_id, 'meta', b.meta, 'created_at', b.created_at,
        'admin_name', b.admin_name, 'admin_email', b.admin_email
      ) order by b.created_at desc), '[]'::jsonb)
      from (select * from base order by created_at desc limit v_limit offset v_offset) b
    )
  ) into result;
  return result;
end; $$;
revoke execute on function public.admin_audit_list(text, text, int, int) from public, anon;
grant execute on function public.admin_audit_list(text, text, int, int) to authenticated;

create or replace function public.admin_login_logs(p_limit int default 40)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'action', ale.payload ->> 'action', 'actor', ale.payload ->> 'actor_username',
      'ip', ale.ip_address, 'created_at', ale.created_at
    ) order by ale.created_at desc), '[]'::jsonb)
    from (
      select * from auth.audit_log_entries
      where payload ->> 'action' in ('login','logout','user_signedup','user_recovery_requested','token_refreshed')
      order by created_at desc limit least(greatest(coalesce(p_limit, 40), 1), 100)
    ) ale
  );
end; $$;
revoke execute on function public.admin_login_logs(int) from public, anon;
grant execute on function public.admin_login_logs(int) to authenticated;
