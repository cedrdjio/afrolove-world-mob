-- ============================================================================
-- Perf : désactive le JIT Postgres sur les RPC de découverte
-- ============================================================================
-- Symptôme : juste après l'ajout de ~100 profils de démonstration, l'app s'est
-- mise à « buguer au chargement » (écran Découvrir lent à s'afficher).
--
-- Cause : avec des tables minuscules, le coût estimé de search_profiles restait
-- sous le seuil `jit_above_cost`. Passé ~100 profils, l'estimation a franchi le
-- seuil et Postgres s'est mis à COMPILER (JIT) la requête à chaque appel.
-- Mesuré sur ce projet : 466 ms (JIT actif) contre 55 ms (JIT désactivé) pour
-- un même appel, sur données identiques et chaudes. Le JIT n'apporte aucun gain
-- sur ces petites requêtes OLTP répétées — il ne fait qu'ajouter la latence de
-- compilation à chaque chargement.
--
-- Correctif : on désactive le JIT au niveau des deux fonctions du chemin chaud
-- de la découverte. Ciblé et réversible (aucun impact sur le reste du schéma).
-- ============================================================================

alter function public.search_profiles(
  integer, integer, integer, boolean, boolean, boolean, integer, integer, text, uuid[]
) set jit = off;

alter function public.count_search_profiles(
  integer, integer, integer, boolean, uuid[]
) set jit = off;
