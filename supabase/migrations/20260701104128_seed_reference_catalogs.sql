insert into public.interests (key, label, icon, sort_order) values
  ('musique', 'Musique', 'Music', 1),
  ('danse', 'Danse', 'PartyPopper', 2),
  ('voyage', 'Voyage', 'Plane', 3),
  ('cuisine', 'Cuisine', 'UtensilsCrossed', 4),
  ('art', 'Art', 'Palette', 5),
  ('lecture', 'Lecture', 'BookOpen', 6),
  ('yoga', 'Yoga', 'Sparkles', 7),
  ('mode', 'Mode', 'Shirt', 8),
  ('sport', 'Sport', 'Trophy', 9),
  ('fitness', 'Fitness', 'Dumbbell', 10),
  ('famille', 'Famille', 'Users', 11),
  ('spiritualite', 'Spiritualité', 'HeartHandshake', 12),
  ('culture', 'Culture', 'Globe', 13),
  ('cinema', 'Cinéma', 'Clapperboard', 14),
  ('gaming', 'Gaming', 'Gamepad2', 15),
  ('business', 'Business', 'Briefcase', 16),
  ('technologie', 'Technologie', 'Cpu', 17);

insert into public.languages (key, label, sort_order) values
  ('francais', 'Français', 1),
  ('anglais', 'Anglais', 2),
  ('lingala', 'Lingala', 3),
  ('swahili', 'Swahili', 4),
  ('wolof', 'Wolof', 5),
  ('arabe', 'Arabe', 6),
  ('portugais', 'Portugais', 7),
  ('espagnol', 'Espagnol', 8);

insert into public.religions (key, label, sort_order) values
  ('christianisme', 'Christianisme', 1),
  ('islam', 'Islam', 2),
  ('religions_traditionnelles', 'Religions traditionnelles', 3),
  ('spirituel_non_religieux', 'Spirituel(le) non religieux(se)', 4),
  ('agnostique', 'Agnostique', 5),
  ('athee', 'Athée', 6),
  ('autre', 'Autre', 7);

insert into public.education_levels (key, label, sort_order) values
  ('secondaire', 'Études secondaires', 1),
  ('bac', 'Baccalauréat', 2),
  ('licence', 'Licence', 3),
  ('master', 'Master', 4),
  ('doctorat', 'Doctorat', 5),
  ('formation_professionnelle', 'Formation professionnelle', 6);

insert into public.relationship_goals (key, label, subtitle, sort_order) values
  ('serieuse', 'Relation sérieuse', 'Je cherche un engagement durable', 1),
  ('decontractee', 'Relation décontractée', 'Sans pression, on voit venir', 2),
  ('amitie', 'Amitié', 'Élargir mon cercle social', 3),
  ('mariage', 'Mariage', 'Je suis prêt(e) à me marier', 4),
  ('indecis', 'Je ne sais pas encore', 'Ouvert(e) à voir ce qui se présente', 5);
