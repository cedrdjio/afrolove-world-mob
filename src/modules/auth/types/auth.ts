import type { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
}

export type PendingAuthAction = null | { type: 'recovery'; email?: string };
