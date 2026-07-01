alter table public.profiles add column avatar_url text;

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  position smallint not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index profile_photos_profile_id_idx on public.profile_photos (profile_id, position);

alter table public.profile_photos enable row level security;

create policy "Photos are readable by anyone signed in"
  on public.profile_photos for select to authenticated using (true);

create policy "Users manage their own photos"
  on public.profile_photos for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Enforce the 2-6 photos business rule and keep exactly one primary photo
-- per profile, all inside the database so no client can bypass it.
create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.profile_photos where profile_id = new.profile_id) >= 6 then
    raise exception 'Maximum 6 photos par profil';
  end if;
  return new;
end;
$$;

create trigger before_photo_insert_check_limit
  before insert on public.profile_photos
  for each row execute function public.enforce_photo_limit();

create or replace function public.enforce_single_primary_photo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_primary then
    update public.profile_photos
      set is_primary = false
      where profile_id = new.profile_id and id <> new.id and is_primary;
  end if;
  return new;
end;
$$;

create trigger before_photo_write_enforce_primary
  before insert or update of is_primary on public.profile_photos
  for each row execute function public.enforce_single_primary_photo();

-- Keep profiles.avatar_url denormalized so every screen that shows an
-- avatar (matches list, chat header, discovery) reads one column instead
-- of joining profile_photos every time.
create or replace function public.sync_profile_avatar()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_profile_id uuid := coalesce(new.profile_id, old.profile_id);
begin
  update public.profiles
    set avatar_url = (
      select url from public.profile_photos
      where profile_id = target_profile_id
      order by is_primary desc, position asc, created_at asc
      limit 1
    )
    where id = target_profile_id;
  return null;
end;
$$;

create trigger after_photo_change_sync_avatar
  after insert or update or delete on public.profile_photos
  for each row execute function public.sync_profile_avatar();
