import { create } from 'zustand';
import { Image } from 'expo-image';
import type { DiscoveryProfile } from '@/modules/discovery/types/discovery';

/**
 * Store central du deck Découverte — le « NgRx » de l'app.
 *
 * Objectifs :
 *  · Revenir sur l'onglet Découverte NE recharge RIEN : le deck vit ici,
 *    hors des écrans, et se consomme là où on l'avait laissé.
 *  · Quand la pile baisse, on recharge PAR AJOUT (pagination intelligente) —
 *    les profils déjà swipés étant exclus côté serveur, chaque appel ramène
 *    la suite, jamais un remplacement visible.
 *  · Les photos des prochains profils sont PRÉCHARGÉES (mémoire + disque)
 *    dès l'arrivée des données : la première carte s'affiche instantanément,
 *    les suivantes aussi.
 *  · Un like / pass / favori (écran Découverte OU fiche détail) « consomme »
 *    le profil ici : tous les écrans restent synchronisés sans refetch.
 */

const PREFETCH_COUNT = 10;
const REFILL_THRESHOLD = 4;

function prefetchAvatars(profiles: DiscoveryProfile[]) {
  const urls = profiles
    .slice(0, PREFETCH_COUNT)
    .map((p) => p.avatarUrl)
    .filter((u): u is string => Boolean(u));
  // L'ordre du tableau est respecté : la 1re image télécharge en premier.
  if (urls.length) Image.prefetch(urls, { cachePolicy: 'memory-disk' }).catch(() => {});
}

type DeckStatus = 'idle' | 'loading' | 'refilling' | 'error';

interface DeckState {
  profiles: DiscoveryProfile[];
  consumedIds: Set<string>;
  /** Signature des filtres du deck courant — un changement de filtres recharge. */
  filtersKey: string | null;
  status: DeckStatus;
  error: unknown;
  /** Vrai quand le serveur n'a plus rien à donner pour ces filtres. */
  exhausted: boolean;
  /** Charge le deck si (et seulement si) les filtres ont changé ou s'il est vide. */
  loadInitial: (key: string, fetcher: () => Promise<DiscoveryProfile[]>) => Promise<void>;
  /** Ajoute la page suivante au deck (dédupliquée), sans rien remplacer. */
  refill: (fetcher: () => Promise<DiscoveryProfile[]>) => Promise<void>;
  /** Marque un profil comme traité (like/pass/favori) : il sort du deck. */
  consume: (id: string) => void;
  /** Oublie tout — utilisé par « réessayer » et le changement de compte. */
  reset: () => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  profiles: [],
  consumedIds: new Set<string>(),
  filtersKey: null,
  status: 'idle',
  error: null,
  exhausted: false,

  loadInitial: async (key, fetcher) => {
    const s = get();
    const remaining = s.profiles.filter((p) => !s.consumedIds.has(p.id)).length;
    // Mêmes filtres et encore des cartes (ou déjà en cours) → on consomme le
    // cache tel quel, aucun appel réseau, aucun re-rendu de chargement.
    if (s.filtersKey === key && (remaining > 0 || s.status === 'loading')) return;
    if (s.filtersKey === key && s.status === 'refilling') return;

    set({ status: 'loading', error: null, filtersKey: key, exhausted: false });
    try {
      const profiles = await fetcher();
      // Le deck redémarre proprement pour ces filtres.
      set({ profiles, consumedIds: new Set(), status: 'idle', exhausted: profiles.length === 0 });
      prefetchAvatars(profiles);
    } catch (error) {
      set({ status: 'error', error });
    }
  },

  refill: async (fetcher) => {
    const s = get();
    if (s.status !== 'idle' || s.exhausted) return;
    set({ status: 'refilling' });
    try {
      const fresh = await fetcher();
      const known = new Set(get().profiles.map((p) => p.id));
      const consumed = get().consumedIds;
      const additions = fresh.filter((p) => !known.has(p.id) && !consumed.has(p.id));
      set((state) => ({
        profiles: [...state.profiles, ...additions],
        status: 'idle',
        // Rien de neuf = fin du vivier pour ces filtres (évite de boucler).
        exhausted: additions.length === 0,
      }));
      prefetchAvatars(additions);
    } catch {
      // Un refill raté n'est pas bloquant : le deck actuel continue.
      set({ status: 'idle' });
    }
  },

  consume: (id) => set((s) => ({ consumedIds: new Set(s.consumedIds).add(id) })),

  reset: () =>
    set({ profiles: [], consumedIds: new Set(), filtersKey: null, status: 'idle', error: null, exhausted: false }),
}));
