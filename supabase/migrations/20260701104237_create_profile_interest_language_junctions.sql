create table public.profile_interests (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete cascade,
  primary key (profile_id, interest_id)
);

create table public.profile_languages (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  language_id uuid not null references public.languages (id) on delete cascade,
  primary key (profile_id, language_id)
);

alter table public.profile_interests enable row level security;
alter table public.profile_languages enable row level security;

create policy "Profile interests are readable by anyone signed in"
  on public.profile_interests for select to authenticated using (true);
create policy "Users manage their own interests"
  on public.profile_interests for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Profile languages are readable by anyone signed in"
  on public.profile_languages for select to authenticated using (true);
create policy "Users manage their own languages"
  on public.profile_languages for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
