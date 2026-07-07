-- Sprint A6 — catalogues de contenu éditables.
-- Nouvelles tables de référence (pays, villes, style de vie, professions),
-- lisibles par l'app, modifiables uniquement via des RPC admin definer.

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,          -- code ISO 3166-1 alpha-2
  label text not null,
  emoji text,                        -- drapeau
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  country_key text references public.countries (key) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.lifestyle_options (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  category text not null,            -- smoking | drinking | gym | pets | children
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.occupations (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.lifestyle_options enable row level security;
alter table public.occupations enable row level security;

create policy "countries_read" on public.countries for select to anon, authenticated using (true);
create policy "cities_read" on public.cities for select to anon, authenticated using (true);
create policy "lifestyle_read" on public.lifestyle_options for select to anon, authenticated using (true);
create policy "occupations_read" on public.occupations for select to anon, authenticated using (true);

grant select on public.countries, public.cities, public.lifestyle_options, public.occupations to anon, authenticated;

-- ── Seed réel ────────────────────────────────────────────────────────
insert into public.countries (key, label, emoji, sort_order) values
  ('SN','Sénégal','🇸🇳',1),('CI','Côte d''Ivoire','🇨🇮',2),('CM','Cameroun','🇨🇲',3),
  ('ML','Mali','🇲🇱',4),('CD','RD Congo','🇨🇩',5),('CG','Congo','🇨🇬',6),
  ('GA','Gabon','🇬🇦',7),('BJ','Bénin','🇧🇯',8),('TG','Togo','🇹🇬',9),
  ('BF','Burkina Faso','🇧🇫',10),('GN','Guinée','🇬🇳',11),('NG','Nigeria','🇳🇬',12),
  ('GH','Ghana','🇬🇭',13),('MA','Maroc','🇲🇦',14),('DZ','Algérie','🇩🇿',15),
  ('TN','Tunisie','🇹🇳',16),('FR','France','🇫🇷',20),('BE','Belgique','🇧🇪',21),
  ('CH','Suisse','🇨🇭',22),('DE','Allemagne','🇩🇪',23),('ES','Espagne','🇪🇸',24),
  ('IT','Italie','🇮🇹',25),('GB','Royaume-Uni','🇬🇧',26),('NL','Pays-Bas','🇳🇱',27),
  ('PT','Portugal','🇵🇹',28),('CA','Canada','🇨🇦',29),('US','États-Unis','🇺🇸',30);

insert into public.cities (key, label, country_key, sort_order) values
  ('dakar','Dakar','SN',1),('thies','Thiès','SN',2),('saint-louis','Saint-Louis','SN',3),
  ('abidjan','Abidjan','CI',1),('yamoussoukro','Yamoussoukro','CI',2),
  ('douala','Douala','CM',1),('yaounde','Yaoundé','CM',2),('bafoussam','Bafoussam','CM',3),
  ('bamako','Bamako','ML',1),('kinshasa','Kinshasa','CD',1),('lubumbashi','Lubumbashi','CD',2),
  ('brazzaville','Brazzaville','CG',1),('libreville','Libreville','GA',1),
  ('cotonou','Cotonou','BJ',1),('lome','Lomé','TG',1),('ouagadougou','Ouagadougou','BF',1),
  ('conakry','Conakry','GN',1),('lagos','Lagos','NG',1),('abuja','Abuja','NG',2),
  ('accra','Accra','GH',1),('casablanca','Casablanca','MA',1),('rabat','Rabat','MA',2),
  ('alger','Alger','DZ',1),('tunis','Tunis','TN',1),
  ('paris','Paris','FR',1),('lyon','Lyon','FR',2),('marseille','Marseille','FR',3),
  ('lille','Lille','FR',4),('reims','Reims','FR',5),('toulouse','Toulouse','FR',6),
  ('bordeaux','Bordeaux','FR',7),('bruxelles','Bruxelles','BE',1),('liege','Liège','BE',2),
  ('geneve','Genève','CH',1),('berlin','Berlin','DE',1),('madrid','Madrid','ES',1),
  ('rome','Rome','IT',1),('londres','Londres','GB',1),('amsterdam','Amsterdam','NL',1),
  ('lisbonne','Lisbonne','PT',1),('montreal','Montréal','CA',1);

insert into public.lifestyle_options (key, label, category, sort_order) values
  ('smoking_no','Non-fumeur','smoking',1),('smoking_sometimes','Fumeur occasionnel','smoking',2),('smoking_yes','Fumeur','smoking',3),
  ('drinking_never','Ne boit jamais','drinking',1),('drinking_social','Socialement','drinking',2),('drinking_regular','Régulièrement','drinking',3),
  ('gym_never','Jamais de sport','gym',1),('gym_sometimes','Sport parfois','gym',2),('gym_often','Sport souvent','gym',3),
  ('pets_none','Pas d''animaux','pets',1),('pets_dog','Chien','pets',2),('pets_cat','Chat','pets',3),('pets_other','Autre animal','pets',4),
  ('children_no','N''en veut pas','children',1),('children_want','En veut','children',2),('children_have','En a déjà','children',3),('children_maybe','Indécis','children',4);

insert into public.occupations (key, label, sort_order) values
  ('student','Étudiant·e',1),('engineer','Ingénieur·e',2),('architect','Architecte',3),
  ('doctor','Médecin',4),('nurse','Infirmier·e',5),('teacher','Enseignant·e',6),
  ('trader','Commerçant·e',7),('entrepreneur','Entrepreneur·e',8),('artist','Artiste',9),
  ('developer','Développeur·se',10),('lawyer','Avocat·e',11),('accountant','Comptable',12),
  ('consultant','Consultant·e',13),('civil_servant','Fonctionnaire',14),('driver','Chauffeur',15),
  ('cook','Cuisinier·e',16),('hairdresser','Coiffeur·se',17),('journalist','Journaliste',18),
  ('musician','Musicien·ne',19),('athlete','Sportif·ve',20);

-- ── CRUD générique (whitelist de catalogues) ─────────────────────────
-- La liste blanche empêche toute injection via le nom de table.
create or replace function public.admin_catalog_allowed(p_catalog text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_catalog = any (array[
    'interests','languages','religions','relationship_goals','education_levels',
    'countries','cities','lifestyle_options','occupations'
  ]);
$$;

create or replace function public.admin_catalog_list(p_catalog text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if public.admin_role_level() < 0 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if not public.admin_catalog_allowed(p_catalog) then
    raise exception 'unknown catalog %', p_catalog;
  end if;

  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t) order by t.sort_order, t.label), ''[]''::jsonb) from public.%I t',
    p_catalog
  ) into result;
  return result;
end;
$$;

revoke execute on function public.admin_catalog_list(text) from public, anon;
grant execute on function public.admin_catalog_list(text) to authenticated;

-- Création / mise à jour. Colonnes issues du schéma réel de la table ;
-- id absent ⇒ insertion avec valeur par défaut (uuid généré).
create or replace function public.admin_catalog_upsert(p_catalog text, p_row jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_has_id boolean := (p_row ? 'id') and nullif(p_row ->> 'id', '') is not null;
  v_cols text;
  v_updates text;
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if not public.admin_catalog_allowed(p_catalog) then
    raise exception 'unknown catalog %', p_catalog;
  end if;

  select string_agg(quote_ident(column_name), ', '),
         string_agg(
           quote_ident(column_name) || ' = excluded.' || quote_ident(column_name),
           ', '
         ) filter (where column_name <> 'id')
    into v_cols, v_updates
  from information_schema.columns
  where table_schema = 'public' and table_name = p_catalog
    and (v_has_id or column_name <> 'id')
    and column_name = any (
      select jsonb_object_keys(p_row)
      union select 'id'
    );

  if v_cols is null then
    raise exception 'no valid columns supplied';
  end if;

  if v_has_id then
    execute format(
      'insert into public.%1$I (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1)
       on conflict (id) do update set %3$s',
      p_catalog, v_cols, v_updates
    ) using p_row;
  else
    execute format(
      'insert into public.%1$I (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1)',
      p_catalog, v_cols
    ) using p_row;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'catalog.upsert', 'catalog', p_catalog, p_row);
end;
$$;

revoke execute on function public.admin_catalog_upsert(text, jsonb) from public, anon;
grant execute on function public.admin_catalog_upsert(text, jsonb) to authenticated;

create or replace function public.admin_catalog_delete(p_catalog text, p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if public.admin_role_level() < 3 then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  if not public.admin_catalog_allowed(p_catalog) then
    raise exception 'unknown catalog %', p_catalog;
  end if;

  execute format('delete from public.%I where id = $1', p_catalog) using p_id;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, meta)
  values ((select auth.uid()), 'catalog.delete', 'catalog', p_catalog,
          jsonb_build_object('id', p_id));
end;
$$;

revoke execute on function public.admin_catalog_delete(text, uuid) from public, anon;
grant execute on function public.admin_catalog_delete(text, uuid) to authenticated;
