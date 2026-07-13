import { supabase } from '@/shared/services/supabase/client';

type LogLevel = 'info' | 'warn' | 'error';

/**
 * Journal applicatif — trace en base (table client_logs) les événements
 * importants : crashs, étapes de paiement, erreurs marquantes. Consultable
 * par les admins dans Paramètres → Journal, sans outil externe.
 *
 * Fire-and-forget : ne bloque jamais l'UI et n'échoue jamais visiblement
 * (un journal qui plante l'app serait pire que pas de journal).
 */
export function logEvent(
  level: LogLevel,
  event: string,
  message?: string,
  context?: Record<string, unknown>,
): void {
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const profileId = data.session?.user.id;
      if (!profileId) return; // RLS : insertion propre uniquement

      await supabase.from('client_logs').insert({
        profile_id: profileId,
        level,
        event,
        message: message?.slice(0, 1000) ?? null,
        context: (context ?? null) as never,
      });
    } catch {
      // silencieux par design
    }
  })();
}
