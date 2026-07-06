-- La recréation de search_profiles (filtre par intérêts) a restauré le grant
-- EXECUTE par défaut accordé à PUBLIC — anon y avait donc de nouveau accès
-- (sans données : le CTE viewer est vide hors session, mais on referme quand
-- même, comme 20260702130000_harden_function_grants).
revoke execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text, uuid[]) from public, anon;
grant execute on function public.search_profiles(int, int, int, boolean, boolean, boolean, int, int, text, uuid[]) to authenticated;
