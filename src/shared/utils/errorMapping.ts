import { AuthApiError, AuthError } from '@supabase/supabase-js';

export type AppErrorKind =
  | 'no_internet'
  | 'server_error'
  | 'invalid_credentials'
  | 'email_exists'
  | 'weak_password'
  | 'invalid_email'
  | 'session_expired'
  | 'timeout'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  title: string;
  message: string;
  retryable: boolean;
}

const APP_ERRORS: Record<AppErrorKind, Omit<AppError, 'kind'>> = {
  no_internet: {
    title: 'Pas de connexion',
    message: "Vérifiez votre connexion internet et réessayez.",
    retryable: true,
  },
  server_error: {
    title: 'Erreur serveur',
    message: "Un problème technique est survenu de notre côté. Réessayez dans quelques instants.",
    retryable: true,
  },
  invalid_credentials: {
    title: 'Identifiants incorrects',
    message: "L'email ou le mot de passe est incorrect.",
    retryable: false,
  },
  email_exists: {
    title: 'Email déjà utilisé',
    message: 'Un compte existe déjà avec cette adresse email. Connectez-vous plutôt.',
    retryable: false,
  },
  weak_password: {
    title: 'Mot de passe trop faible',
    message: 'Choisissez un mot de passe plus robuste (au moins 6 caractères).',
    retryable: false,
  },
  invalid_email: {
    title: 'Email invalide',
    message: "Cette adresse email n'est pas valide.",
    retryable: false,
  },
  session_expired: {
    title: 'Session expirée',
    message: 'Votre session a expiré. Merci de vous reconnecter.',
    retryable: false,
  },
  timeout: {
    title: 'Délai dépassé',
    message: "La requête a pris trop de temps. Vérifiez votre connexion et réessayez.",
    retryable: true,
  },
  unknown: {
    title: 'Une erreur est survenue',
    message: 'Quelque chose a mal tourné. Merci de réessayer.',
    retryable: true,
  },
};

function buildError(kind: AppErrorKind, overrideMessage?: string): AppError {
  return { kind, ...APP_ERRORS[kind], ...(overrideMessage ? { message: overrideMessage } : {}) };
}

/**
 * Normalizes any error thrown by Supabase, fetch, or React Query into a
 * single AppError shape so every screen renders the same illustration +
 * title + message + retry affordance for a given failure kind.
 */
export function mapToAppError(error: unknown): AppError {
  console.error('[mapToAppError] raw error', error);

  if (error instanceof AuthError && error.name === 'AuthRetryableFetchError') {
    // Thrown when the underlying fetch itself rejects (network down, our
    // 15s timeout aborting, CORS, etc) rather than the server responding
    // with an error — status is always 0 here so it never matches the
    // code/status checks below.
    const message = error.message.toLowerCase();
    if (message.includes('timed out') || message.includes('abort')) {
      return buildError('timeout');
    }
    return buildError('no_internet');
  }

  if (error instanceof AuthApiError || error instanceof AuthError) {
    const code = 'code' in error ? (error as { code?: string }).code : undefined;
    const status = 'status' in error ? (error as { status?: number }).status : undefined;
    const message = error.message.toLowerCase();

    if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
      return buildError('invalid_credentials');
    }
    if (code === 'user_already_exists' || code === 'email_exists' || message.includes('already registered')) {
      return buildError('email_exists');
    }
    if (code === 'weak_password' || (message.includes('password') && message.includes('weak'))) {
      return buildError('weak_password');
    }
    if (code === 'validation_failed' || code === 'email_address_invalid' || message.includes('invalid email')) {
      return buildError('invalid_email');
    }
    if (code === 'session_expired' || code === 'refresh_token_not_found' || code === 'session_not_found') {
      return buildError('session_expired');
    }
    if (status && status >= 500) {
      return buildError('server_error');
    }
    return buildError('unknown', error.message);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (error.name === 'AbortError' || message.includes('timeout') || message.includes('timed out')) {
      return buildError('timeout');
    }
    if (
      message.includes('network request failed') ||
      message.includes('fetch failed') ||
      message.includes('failed to fetch')
    ) {
      return buildError('no_internet');
    }
  }

  return buildError('unknown');
}
