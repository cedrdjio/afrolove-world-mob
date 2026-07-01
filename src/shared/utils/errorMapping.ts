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
function isAbortOrTimeout(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    error.name === 'AbortError' ||
    message.includes('abort') ||
    message.includes('timeout') ||
    message.includes('timed out')
  );
}

export function mapToAppError(error: unknown): AppError {
  // GoTrue wraps the raw fetch/AbortError into its own AuthError/AuthApiError
  // subclasses, so this check must run before the class-specific branches
  // below or an aborted request falls through to the raw-message 'unknown'
  // case instead of the friendly 'timeout' one.
  if (error instanceof Error && isAbortOrTimeout(error)) {
    return buildError('timeout');
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
    if (
      error.message.toLowerCase().includes('network request failed') ||
      error.message.toLowerCase().includes('fetch failed') ||
      error.message.toLowerCase().includes('failed to fetch')
    ) {
      return buildError('no_internet');
    }
  }

  return buildError('unknown');
}
