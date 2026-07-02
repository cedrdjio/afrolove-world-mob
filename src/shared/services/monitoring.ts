import * as Sentry from '@sentry/react-native';

/**
 * Crash reporting. Inert until EXPO_PUBLIC_SENTRY_DSN is set (create a
 * project on sentry.io, paste its DSN in .env / EAS secrets) — the app runs
 * exactly the same without it, so this is safe to ship before the account
 * exists. Source-map upload activates later by adding SENTRY_AUTH_TOKEN to
 * the EAS build environment.
 */
export function initMonitoring(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Keep costs low at launch: sample traces lightly, keep all errors.
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    sendDefaultPii: false,
  });
}

export { Sentry };
