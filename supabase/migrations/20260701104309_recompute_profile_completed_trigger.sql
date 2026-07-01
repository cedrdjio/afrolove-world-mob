-- Single source of truth for "is this profile complete enough for
-- Discovery" — computed in the database (not the client) so it can never
-- drift, and so a future admin dashboard can query/filter on it directly.
create or replace function public.recompute_profile_completed()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.profile_id, old.profile_id, new.id, old.id);
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

create trigger after_photos_change_recompute_completion
  after insert or update or delete on public.profile_photos
  for each row execute function public.recompute_profile_completed();

create trigger after_interests_change_recompute_completion
  after insert or delete on public.profile_interests
  for each row execute function public.recompute_profile_completed();

create trigger after_profile_fields_change_recompute_completion
  after update of bio, smoking, drinking, gym_habit, has_pets, wants_children, gender, looking_for, birth_date
  on public.profiles
  for each row execute function public.recompute_profile_completed();
