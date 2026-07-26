-- Incident sécurité (2026-07-26) — détection immédiate de toute modification
-- d'identifiant (mot de passe / e-mail) sur un compte back-office actif.
--
-- Contexte : les connexions au dashboard cassaient de façon répétée parce que
-- les comptes admin étaient partagés avec l'app mobile ; les flux mobiles de
-- récupération / changement de mot de passe réécrivaient le mot de passe partagé.
-- Le journal auth natif (auth.audit_log_entries) étant vide, ce garde-fou fournit
-- une trace forensique fiable dans admin_audit_log et permet de diagnostiquer
-- instantanément tout futur incident. Détectif (journalise), non bloquant.
create or replace function public.audit_admin_credential_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.admin_users au
             where au.user_id = new.id and au.is_active) then
    if new.encrypted_password is distinct from old.encrypted_password then
      insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
      values (new.id, 'security.admin_password_changed', 'auth_user', new.id::text,
              jsonb_build_object(
                'at', now(),
                'last_sign_in_at', new.last_sign_in_at,
                'seconds_after_last_login',
                  extract(epoch from (now() - new.last_sign_in_at))
              ));
    end if;
    if new.email is distinct from old.email then
      insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
      values (new.id, 'security.admin_email_changed', 'auth_user', new.id::text,
              jsonb_build_object('old_email', old.email, 'new_email', new.email));
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_admin_credential_change on auth.users;
create trigger trg_audit_admin_credential_change
  after update on auth.users
  for each row execute function public.audit_admin_credential_change();
