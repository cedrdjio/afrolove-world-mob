import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase/client';
import type { AuthStatus, PendingAuthAction } from '@/modules/auth/types/auth';

interface AuthStoreState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Set when a deep link carries a `type=recovery` session, so the app
   *  routes the user to the Reset Password screen instead of Home. */
  pendingAction: PendingAuthAction;
  setPendingAction: (action: PendingAuthAction) => void;
  initialize: () => () => void;
}

let initialized = false;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'idle',
  session: null,
  user: null,
  pendingAction: null,
  setPendingAction: (pendingAction) => set({ pendingAction }),
  initialize: () => {
    if (initialized) return () => {};
    initialized = true;

    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: data.session ? 'authenticated' : 'unauthenticated',
      });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
      });

      if (event === 'SIGNED_OUT') {
        get().setPendingAction(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  },
}));
