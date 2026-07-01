alter table public.profiles
  add column last_name text,
  add column bio text,
  add column height_cm smallint check (height_cm is null or height_cm between 100 and 250),
  add column profession text,
  add column country text,
  add column education_level_id uuid references public.education_levels (id),
  add column religion_id uuid references public.religions (id),
  add column relationship_goal_id uuid references public.relationship_goals (id),
  add column smoking text check (smoking in ('non_smoker', 'occasional', 'smoker')),
  add column drinking text check (drinking in ('never', 'socially', 'regularly')),
  add column gym_habit text check (gym_habit in ('never', 'occasional', 'regular')),
  add column has_pets text check (has_pets in ('love', 'neutral', 'not_fan')),
  add column wants_children text check (wants_children in ('not_wanted', 'has_children', 'wants')),
  add column profile_completed boolean not null default false,
  add constraint profiles_birth_date_min_age check (
    birth_date is null or birth_date <= (current_date - interval '18 years')
  );

-- Superseded by profile_photos / profile_interests below.
alter table public.profiles
  drop column interests,
  drop column lifestyle,
  drop column photos;
