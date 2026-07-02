const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Conversation-list style timestamp: 14:32 today, "Hier", "Lun", then 12/06. */
export function formatConversationTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (dayDiff <= 0) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  if (dayDiff === 1) return 'Hier';
  if (dayDiff < 7) return WEEKDAYS_FR[date.getDay()];
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/** In-chat bubble timestamp — always HH:MM. */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
