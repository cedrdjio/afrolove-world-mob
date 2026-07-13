-- Accès aux secrets applicatifs stockés dans Supabase Vault, réservé aux
-- edge functions (service_role). Les clients anon/authenticated ne peuvent
-- ni exécuter cette fonction ni lire le schéma vault.
--
-- Les secrets eux-mêmes se créent avec :
--   select vault.create_secret('<valeur>', 'CAMERPAY_API_TOKEN', 'description');
--   select vault.create_secret('<valeur>', 'CAMERPAY_WEBHOOK_SECRET', 'description');
-- (jamais dans une migration versionnée — le Vault vit hors du repo.)

create or replace function public.get_app_secret(p_name text)
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = p_name
  order by created_at desc
  limit 1;
$$;

revoke all on function public.get_app_secret(text) from public;
revoke all on function public.get_app_secret(text) from anon;
revoke all on function public.get_app_secret(text) from authenticated;
grant execute on function public.get_app_secret(text) to service_role;
