-- recompute_profile_completed referenced new.profile_id / new.id in a single
-- COALESCE, but PostgreSQL type-checks every field reference in the
-- expression regardless of COALESCE short-circuiting. profile_interests /
-- profile_languages have no `id` column and profiles has no `profile_id`, so
-- the trigger raised 42703 (`record "new" has no field "id"`) on every
-- insert/update/delete it watched — blocking interests selection, photo
-- inserts and profile-field updates. Reading through jsonb instead makes
-- missing keys resolve to null without any type error.
create or replace function public.recompute_profile_completed()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  target_id uuid := coalesce((rec ->> 'profile_id')::uuid, (rec ->> 'id')::uuid);
  photo_count int;
  interest_count int;
  is_complete boolean;
begin
  select count(*) into photo_count from public.profile_photos where profile_id = target_id;
  select count(*) into interest_count from public.profile_interests where profile_id = target_id;

  select (
    p.bio is not null and length(trim(p.bio)) > 0
    and interest_count >= 3
    and photo_count >= 2
    and p.smoking is not null
    and p.drinking is not null
    and p.gym_habit is not null
    and p.has_pets is not null
    and p.wants_children is not null
    and p.gender is not null
    and p.looking_for is not null
    and p.birth_date is not null
  ) into is_complete
  from public.profiles p
  where p.id = target_id;

  update public.profiles set profile_completed = coalesce(is_complete, false) where id = target_id;
  return null;
end;
$$;

-- The register form collects a first name and signUp passes it as
-- raw_user_meta_data.first_name, but handle_new_user dropped it. Copy it into
-- the profile row so onboarding can prefill it and it is never silently lost.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
