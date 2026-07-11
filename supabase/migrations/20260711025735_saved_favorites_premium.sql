-- Favoris = "sauvegarder / mettre de côté" un profil, réservé aux abonnés
-- premium. C'est distinct des likes (swipes). Un membre premium met un profil
-- en favori ; les non-premium sont bloqués (PREMIUM_REQUIRED → paywall côté app).

create table public.profile_favorites (
  profile_id uuid not null references public.profiles (id) on delete cascade, -- propriétaire (premium)
  target_id  uuid not null references public.profiles (id) on delete cascade, -- profil sauvegardé
  created_at timestamptz not null default now(),
  primary key (profile_id, target_id)
);

create index profile_favorites_owner_idx on public.profile_favorites (profile_id, created_at desc);

alter table public.profile_favorites enable row level security;

-- Le membre lit ses propres favoris ; toute écriture passe par les RPC ci-dessous.
create policy "Members read their own saved favorites"
  on public.profile_favorites for select to authenticated
  using (auth.uid() = profile_id);

-- Ajout premium-only : la garde vit ici, impossible à contourner côté client.
create or replace function public.add_favorite(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_active_premium(auth.uid()) then
    raise exception 'PREMIUM_REQUIRED';
  end if;
  if p_target_id = auth.uid() then
    raise exception 'CANNOT_FAVORITE_SELF';
  end if;
  insert into public.profile_favorites (profile_id, target_id)
  values (auth.uid(), p_target_id)
  on conflict do nothing;
end;
$$;

revoke execute on function public.add_favorite(uuid) from public, anon;
grant execute on function public.add_favorite(uuid) to authenticated;

-- Retrait : pas de garde premium (on peut toujours retirer ce qu'on a mis).
create or replace function public.remove_favorite(p_target_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.profile_favorites
  where profile_id = auth.uid() and target_id = p_target_id;
$$;

revoke execute on function public.remove_favorite(uuid) from public, anon;
grant execute on function public.remove_favorite(uuid) to authenticated;

-- Liste des favoris sauvegardés (profils actifs, non bloqués).
create or replace function public.get_saved_favorites()
returns table (
  profile_id uuid,
  first_name text,
  avatar_url text,
  city text,
  is_verified boolean,
  saved_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.first_name, p.avatar_url, p.city, p.is_verified, f.created_at
  from public.profile_favorites f
  join public.profiles p on p.id = f.target_id
  where f.profile_id = auth.uid()
    and p.account_status = 'active'
    and not public.is_blocked_between(auth.uid(), p.id)
  order by f.created_at desc
  limit 200;
$$;

revoke execute on function public.get_saved_favorites() from public, anon;
grant execute on function public.get_saved_favorites() to authenticated;

-- Set des cibles déjà en favori (pour l'état du bouton dans Discover).
create or replace function public.get_my_favorite_ids()
returns table (target_id uuid)
language sql
security definer
set search_path = public
as $$
  select target_id from public.profile_favorites where profile_id = auth.uid();
$$;

revoke execute on function public.get_my_favorite_ids() from public, anon;
grant execute on function public.get_my_favorite_ids() to authenticated;
