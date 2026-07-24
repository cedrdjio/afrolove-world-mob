import { create } from 'zustand';

/**
 * Deck partagé entre l'écran Découverte et la fiche profil.
 *
 * Problème résolu : la fiche détail est une route à part (`/profile/[id]`).
 * Quand on y faisait un like / dislike / favori, l'écran Découverte —
 * toujours monté dessous — gardait le même profil en haut au retour (son
 * index local n'avançait pas). On centralise donc les identifiants « déjà
 * traités » : la Découverte filtre ces profils, donc agir depuis la fiche
 * fait immédiatement passer au suivant.
 */
interface DeckState {
  consumedIds: Set<string>;
  /** Marque un profil comme traité (like, pass ou favori) : il disparaît du deck. */
  consume: (id: string) => void;
  /** Vide la liste — appelé quand on recharge un nouveau lot de profils. */
  clear: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  consumedIds: new Set<string>(),
  consume: (id) => set((s) => ({ consumedIds: new Set(s.consumedIds).add(id) })),
  clear: () => set((s) => (s.consumedIds.size === 0 ? s : { consumedIds: new Set<string>() })),
}));
