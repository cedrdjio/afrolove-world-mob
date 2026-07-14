-- ============================================================================
-- Seed : 100 profils de démonstration AfriLove World
-- ============================================================================
-- Outil de test interne. Crée 100 comptes CONNECTABLES et complets :
--   · emails    : demo001@demo.afrilove.app … demo100@demo.afrilove.app
--   · mot de passe (tous) : Demo!2026
--   · 50 femmes / 50 hommes, prénoms africains et européens mélangés
--   · photos : portraits libres randomuser.me + photo d'ambiance picsum.photos
--   · 24 villes (Cameroun, Afrique de l'Ouest/Est, Europe, Amérique du Nord)
--     avec latitude/longitude réelles (la colonne location est générée)
--   · bio, profession, taille, style de vie, 3 intérêts, 2 langues
--   · onboarding_completed = true, 1 profil sur 3 avec badge vérifié,
--     last_active_at étalé sur 3 jours (alimente « En ligne il y a X »)
--
-- Idempotent : relancer le script purge et recrée les comptes démo.
-- Nettoyage complet :
--   delete from auth.users where email like 'demo%@demo.afrilove.app';
-- ============================================================================

do $$
declare
  v_pwd text;
  f_names text[] := array['Aminata','Fatou','Awa','Aïcha','Mariama','Nadège','Clarisse','Sandrine','Josiane','Larissa','Michelle','Dorine','Solange','Estelle','Vanessa','Grace','Chantal','Brenda','Yvette','Carine','Diane','Laetitia','Nathalie','Prisca','Marième','Emma','Léa','Chloé','Camille','Manon','Julie','Sarah','Laura','Pauline','Marion','Lucie','Anna','Elodie','Sophie','Charlotte','Alice','Marine','Amandine','Justine','Mathilde','Eva','Clara','Inès','Jade','Zoé'];
  m_names text[] := array['Mamadou','Ousmane','Ibrahim','Cédric','Serge','Franck','Thierry','Rodrigue','Junior','Boris','Landry','Steve','Arnaud','Patrick','Hervé','Yannick','Alain','Didier','Samuel','Emmanuel','Christian','Rostand','Blaise','Paulin','Abdou','Lucas','Hugo','Thomas','Antoine','Julien','Maxime','Nicolas','Alexandre','Romain','Clément','Quentin','Florian','Adrien','Benjamin','Damien','Vincent','Mathieu','Sébastien','Guillaume','Pierre','Louis','Nathan','Théo','Raphaël','Gabriel'];
  l_names text[] := array['Ngo','Kamga','Diallo','Traoré','Mbarga','Fotso','Nkeng','Tchoupo','Onana','Ekambi','Martin','Bernard','Dubois','Laurent','Moreau','Petit','Durand','Leroy','Roux','Fontaine','Mendy','Sarr','Kouassi','Mensah','Okafor','Ndiaye','Bakayoko','Essomba','Girard','Lambert'];
  cities text[] := array['Douala|Cameroun|4.05|9.70','Yaoundé|Cameroun|3.87|11.52','Bafoussam|Cameroun|5.48|10.42','Abidjan|Côte d''Ivoire|5.36|-4.01','Dakar|Sénégal|14.72|-17.47','Lagos|Nigéria|6.52|3.38','Accra|Ghana|5.60|-0.19','Nairobi|Kenya|-1.29|36.82','Kinshasa|RD Congo|-4.44|15.27','Johannesburg|Afrique du Sud|-26.20|28.05','Casablanca|Maroc|33.57|-7.59','Libreville|Gabon|0.42|9.47','Paris|France|48.86|2.35','Lyon|France|45.76|4.84','Marseille|France|43.30|5.37','Bruxelles|Belgique|50.85|4.35','Genève|Suisse|46.20|6.14','Montréal|Canada|45.50|-73.57','Londres|Royaume-Uni|51.51|-0.13','Berlin|Allemagne|52.52|13.40','Madrid|Espagne|40.42|-3.70','Rome|Italie|41.90|12.50','New York|États-Unis|40.71|-74.01','Lisbonne|Portugal|38.72|-9.14'];
  bios text[] := array[
    'Passionné(e) de voyages et de bonne cuisine. Je cherche quelqu''un avec qui partager des fous rires.',
    'La famille avant tout. J''aime les soirées simples, la musique et les longues discussions.',
    'Sportif(ve) et gourmand(e) — oui, les deux. Dis-moi ton plat préféré !',
    'Entre deux cultures, le cœur grand ouvert. L''amour n''a pas de frontières.',
    'Je crois aux rencontres vraies. Ici pour construire quelque chose de sérieux.',
    'Amoureux(se) de la vie, de la danse et des couchers de soleil.',
    'Un bon livre, un bon café, une bonne compagnie : ma recette du bonheur.',
    'Toujours partant(e) pour découvrir un nouveau restaurant ou un nouveau pays.',
    'Le sourire est ma langue préférée. Viens me dire bonjour !',
    'Travailleur(se) le jour, rêveur(se) la nuit. Cherche complice pour les deux.',
    'La musique adoucit les mœurs, un bon match adoucit la vie.',
    'Simple, direct(e) et honnête. Le reste, on le découvrira ensemble.',
    'Fan de cinéma et de cuisine du monde. Mon cœur balance entre ndolé et lasagnes.',
    'J''aime rire, voyager et les gens qui savent ce qu''ils veulent.',
    'Nouvelle page de ma vie, et si tu en faisais partie ?',
    'Optimiste incurable. La vie est belle, encore plus à deux.'];
  profs text[] := array['Infirmière','Développeur','Commerçante','Ingénieur','Enseignante','Entrepreneur','Comptable','Styliste','Chauffeur VTC','Médecin','Journaliste','Architecte','Coiffeuse','Électricien','Community manager','Cuisinier'];
  smokings text[] := array['non_smoker','non_smoker','non_smoker','occasional','smoker'];
  drinkings text[] := array['never','socially','socially','regularly'];
  gyms text[] := array['never','occasional','regular','regular'];
  petss text[] := array['love','neutral','not_fan'];
  childrens text[] := array['wants','wants','has_children','not_wanted'];
  i int; idx int; is_f boolean;
  uid uuid; v_email text; v_first text; v_last text;
  c_parts text[]; v_lat float8; v_lng float8;
  v_birth date; v_portrait text; v_photo2 text;
begin
  perform set_config('search_path', 'public, extensions', true);
  v_pwd := extensions.crypt('Demo!2026', extensions.gen_salt('bf'));

  -- Idempotent : purge des anciens comptes démo avant re-création.
  delete from auth.users where email like 'demo%@demo.afrilove.app';
  delete from public.profiles where email like 'demo%@demo.afrilove.app';

  for i in 1..100 loop
    is_f := i <= 50;
    idx := ((i - 1) % 50);
    v_first := case when is_f then f_names[idx + 1] else m_names[idx + 1] end;
    v_last := l_names[1 + ((i * 7) % 30)];
    v_email := format('demo%s@demo.afrilove.app', lpad(i::text, 3, '0'));
    uid := gen_random_uuid();
    c_parts := string_to_array(cities[1 + ((i * 5) % 24)], '|');
    v_lat := c_parts[3]::float8 + ((i % 10) - 5) * 0.003;
    v_lng := c_parts[4]::float8 + ((i % 7) - 3) * 0.003;
    v_birth := (current_date - make_interval(years => 21 + ((i * 13) % 24), days => (i * 3) % 300))::date;
    v_portrait := format('https://randomuser.me/api/portraits/%s/%s.jpg', case when is_f then 'women' else 'men' end, idx);
    v_photo2 := format('https://picsum.photos/seed/afriloveworld-%s/900/1200', i);

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token,
      is_super_admin
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      v_email, v_pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('first_name', v_first, 'last_name', v_last),
      now() - make_interval(days => (i % 40)), now(),
      '', '', '', '', '', '', '', '', false
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', uid::text, now(), now(), now()
    );

    -- handle_new_user a créé la ligne profiles ; on la complète.
    -- (location est une colonne générée depuis latitude/longitude.)
    update public.profiles set
      first_name = v_first,
      last_name = v_last,
      gender = case when is_f then 'femme' else 'homme' end,
      looking_for = case when i % 7 = 0 then 'les-deux' when is_f then 'hommes' else 'femmes' end,
      birth_date = v_birth,
      bio = bios[1 + ((i * 3) % 16)],
      height_cm = 155 + ((i * 11) % 40),
      profession = profs[1 + ((i * 5) % 16)],
      city = c_parts[1],
      country = c_parts[2],
      latitude = v_lat,
      longitude = v_lng,
      location_updated_at = now(),
      smoking = smokings[1 + (i % 5)],
      drinking = drinkings[1 + (i % 4)],
      gym_habit = gyms[1 + (i % 4)],
      has_pets = petss[1 + (i % 3)],
      wants_children = childrens[1 + (i % 4)],
      is_verified = (i % 3 = 0),
      onboarding_completed = true,
      account_status = 'active',
      last_active_at = now() - make_interval(mins => (i * 37) % 4320)
    where id = uid;

    insert into public.profile_photos (profile_id, url, position, is_primary, moderation_status)
    values (uid, v_portrait, 0, true, 'approved'),
           (uid, v_photo2, 1, false, 'approved');

    insert into public.profile_interests (profile_id, interest_id)
    select uid, id from public.interests order by md5(id::text || i::text) limit 3;

    insert into public.profile_languages (profile_id, language_id)
    select uid, id from public.languages order by md5(id::text || i::text) limit 2;
  end loop;
end $$;
