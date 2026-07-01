-- Admin-manageable reference catalogs. Content is data, not schema, so a
-- future admin dashboard can add/edit/reorder/deactivate entries without
-- any app deployment.
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.languages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.religions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.education_levels (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.relationship_goals (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  subtitle text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.interests enable row level security;
alter table public.languages enable row level security;
alter table public.religions enable row level security;
alter table public.education_levels enable row level security;
alter table public.relationship_goals enable row level security;

-- Catalogs are read-only from the client; only service_role (i.e. the
-- future admin dashboard, or SQL editor) can write to them.
create policy "Interests are readable by anyone signed in"
  on public.interests for select to authenticated using (is_active);
create policy "Languages are readable by anyone signed in"
  on public.languages for select to authenticated using (is_active);
create policy "Religions are readable by anyone signed in"
  on public.religions for select to authenticated using (is_active);
create policy "Education levels are readable by anyone signed in"
  on public.education_levels for select to authenticated using (is_active);
create policy "Relationship goals are readable by anyone signed in"
  on public.relationship_goals for select to authenticated using (is_active);
