-- Les broadcasts admin (Sprint A7) insèrent des notifications de type 'admin'.
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type = any (array['match'::text, 'message'::text, 'like'::text, 'kyc'::text, 'admin'::text]));
