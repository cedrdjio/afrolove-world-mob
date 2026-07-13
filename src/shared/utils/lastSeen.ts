/** « Vu il y a X » — présence approximative basée sur le heartbeat
 *  last_active_at. Au-delà d'une semaine on n'affiche rien : l'information
 *  n'aide plus et stigmatise les comptes dormants. */
export function formatLastSeen(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 5) return "En ligne à l'instant";
  if (minutes < 60) return `En ligne il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `En ligne il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'En ligne hier';
  if (days < 7) return `En ligne il y a ${days} j`;
  return null;
}
