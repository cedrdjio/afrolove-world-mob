-- Sprint A9 — réglages système : paramètres clé/valeur, mode maintenance,
-- feature flags, et modèles de messages (e-mail / push).

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.app_settings enable row level security;

create policy "app_settings_read_public" on public.app_settings
  for select to anon, authenticated
  using (key in ('maintenance_mode', 'feature_flags'));
create policy "app_settings_read_admin" on public.app_settings
  for select to authenticated using (public.is_admin());

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  channel text not null check (channel in ('email', 'push')),
  name text not null,
  subject text,
  body text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;
create policy "message_templates_admin" on public.message_templates
  for select to authenticated using (public.is_admin());

create trigger message_templates_set_updated_at
  before update on public.message_templates
  for each row execute function public.handle_updated_at();

insert into public.app_settings (key, value) values
  ('maintenance_mode', '{"enabled": false, "message": "Maintenance en cours, revenez bientôt."}'),
  ('feature_flags', '{"discovery": true, "premium": true, "kyc": true, "messaging": true, "stories": false}'),
  ('general', '{"app_name": "AfriLove World", "support_email": "support@afriloveworld.com", "min_app_version": "1.0.0"}');

insert into public.message_templates (key, channel, name, subject, body) values
  ('welcome_email', 'email', 'E-mail de bienvenue', 'Bienvenue sur AfriLove World 💜',
   'Bonjour {{first_name}},\n\nBienvenue dans la communauté AfriLove World ! Complétez votre profil pour commencer à faire des rencontres sincères.'),
  ('kyc_approved_push', 'push', 'KYC approuvé (push)', null,
   'Votre profil est vérifié ✅ Vous avez maintenant le badge vérifié.'),
  ('kyc_rejected_email', 'email', 'KYC rejeté', 'Votre vérification n''a pas abouti',
   'Bonjour {{first_name}},\n\nVotre demande de vérification n''a pas pu être validée : {{reason}}. Vous pouvez soumettre à nouveau vos documents.'),
  ('new_match_push', 'push', 'Nouveau match (push)', null,
   'Vous avez un nouveau match avec {{partner_name}} ! 💫 Lancez la conversation.');

create or replace function public.admin_get_settings()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  select jsonb_object_agg(key, value) into result from public.app_settings;
  return coalesce(result, '{}'::jsonb);
end; $$;
revoke execute on function public.admin_get_settings() from public, anon;
grant execute on function public.admin_get_settings() to authenticated;

create or replace function public.admin_update_setting(p_key text, p_value jsonb)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  insert into public.app_settings (key, value, updated_at, updated_by)
  values (p_key, p_value, now(), (select auth.uid()))
  on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'setting.update', 'setting', p_key, p_value);
end; $$;
revoke execute on function public.admin_update_setting(text, jsonb) from public, anon;
grant execute on function public.admin_update_setting(text, jsonb) to authenticated;

create or replace function public.admin_list_templates()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(to_jsonb(t) order by t.channel, t.name), '[]'::jsonb) from public.message_templates t);
end; $$;
revoke execute on function public.admin_list_templates() from public, anon;
grant execute on function public.admin_list_templates() to authenticated;

create or replace function public.admin_upsert_template(p_id uuid, p_patch jsonb)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.admin_role_level() < 3 then raise exception 'admin access required' using errcode = '42501'; end if;
  if p_id is null then
    insert into public.message_templates (key, channel, name, subject, body, is_active)
    values (
      coalesce(p_patch ->> 'key', 'template_' || substr(gen_random_uuid()::text, 1, 8)),
      coalesce(p_patch ->> 'channel', 'email'),
      coalesce(p_patch ->> 'name', 'Nouveau modèle'),
      p_patch ->> 'subject',
      coalesce(p_patch ->> 'body', ''),
      coalesce((p_patch ->> 'is_active')::boolean, true)
    );
  else
    update public.message_templates set
      name = coalesce(p_patch ->> 'name', name),
      subject = case when p_patch ? 'subject' then p_patch ->> 'subject' else subject end,
      body = coalesce(p_patch ->> 'body', body),
      is_active = coalesce((p_patch ->> 'is_active')::boolean, is_active)
    where id = p_id;
  end if;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'template.upsert', 'template', coalesce(p_id::text, p_patch ->> 'key'), p_patch);
end; $$;
revoke execute on function public.admin_upsert_template(uuid, jsonb) from public, anon;
grant execute on function public.admin_upsert_template(uuid, jsonb) to authenticated;
