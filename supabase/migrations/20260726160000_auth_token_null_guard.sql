-- Corrige et PRÉVIENT le bug GoTrue « converting NULL to string is unsupported »
-- sur auth.users (renvoie « 500: Database error querying schema » au login).
--
-- Cause racine : un compte créé par INSERT SQL direct (création admin break-glass
-- lors de l'incident de sécurité) laisse les colonnes « token » à NULL. GoTrue,
-- écrit en Go, ne sait pas lire NULL dans une chaîne et échoue AVANT même de
-- vérifier le mot de passe — d'où un login impossible malgré un mot de passe
-- correct. Ces colonnes doivent valoir '' (chaîne vide), jamais NULL.

-- 1) Réparation des lignes existantes (idempotent).
update auth.users set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  email_change               = coalesce(email_change, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where confirmation_token is null
   or recovery_token is null
   or email_change_token_new is null
   or email_change_token_current is null
   or email_change is null
   or phone_change is null
   or phone_change_token is null
   or reauthentication_token is null;

-- 2) Garde-fou permanent : neutralise tout NULL sur ces colonnes AVANT écriture.
--    GoTrue écrit toujours '' de lui-même : ce trigger est un no-op pour lui et
--    n'agit que sur les INSERT/UPDATE SQL manuels — la panne ne peut plus revenir.
create or replace function public.guard_auth_user_tokens()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.confirmation_token         := coalesce(new.confirmation_token, '');
  new.recovery_token             := coalesce(new.recovery_token, '');
  new.email_change_token_new     := coalesce(new.email_change_token_new, '');
  new.email_change_token_current := coalesce(new.email_change_token_current, '');
  new.email_change               := coalesce(new.email_change, '');
  new.phone_change               := coalesce(new.phone_change, '');
  new.phone_change_token         := coalesce(new.phone_change_token, '');
  new.reauthentication_token     := coalesce(new.reauthentication_token, '');
  return new;
end;
$$;

drop trigger if exists trg_guard_auth_user_tokens on auth.users;
create trigger trg_guard_auth_user_tokens
  before insert or update on auth.users
  for each row execute function public.guard_auth_user_tokens();
