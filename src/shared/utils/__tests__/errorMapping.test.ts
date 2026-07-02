import { AuthApiError, AuthRetryableFetchError, StorageApiError } from '@supabase/supabase-js';
import { mapToAppError } from '@/shared/utils/errorMapping';

describe('mapToAppError', () => {
  // Regression test for the exact bug reported by the user: a signup call
  // that hit our own fetch timeout came back as GoTrue's
  // AuthRetryableFetchError wrapping "signal is aborted without reason",
  // and was misclassified as 'unknown' (raw technical message on screen)
  // instead of the friendly 'timeout' kind.
  it('classifies an abort wrapped in AuthRetryableFetchError as a timeout', () => {
    const wrapped = new AuthRetryableFetchError('signal is aborted without reason', 0);

    const result = mapToAppError(wrapped);

    expect(result.kind).toBe('timeout');
    expect(result.message).not.toMatch(/signal is aborted/i);
  });

  it('classifies our own "Request timed out" error the same way once GoTrue re-wraps it', () => {
    const wrapped = new AuthRetryableFetchError('Request timed out', 0);

    expect(mapToAppError(wrapped).kind).toBe('timeout');
  });

  it('classifies a raw DOM AbortError as a timeout', () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    expect(mapToAppError(abortError).kind).toBe('timeout');
  });

  it('classifies invalid login credentials', () => {
    const error = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');

    expect(mapToAppError(error).kind).toBe('invalid_credentials');
  });

  it('classifies an already-registered email as email_exists', () => {
    const error = new AuthApiError('User already registered', 422, 'user_already_exists');

    expect(mapToAppError(error).kind).toBe('email_exists');
  });

  it('classifies a weak password', () => {
    const error = new AuthApiError('Password is too weak', 422, 'weak_password');

    expect(mapToAppError(error).kind).toBe('weak_password');
  });

  it('classifies a 5xx GoTrue error as server_error', () => {
    const error = new AuthApiError('Internal server error', 500, undefined);

    expect(mapToAppError(error).kind).toBe('server_error');
  });

  it('classifies a plain network failure as no_internet', () => {
    expect(mapToAppError(new Error('Network request failed')).kind).toBe('no_internet');
    expect(mapToAppError(new TypeError('Failed to fetch')).kind).toBe('no_internet');
  });

  it('falls back to unknown for anything unrecognized, without leaking the raw message', () => {
    const result = mapToAppError(new Error('some totally unexpected internal error'));

    expect(result.kind).toBe('unknown');
    expect(result.message).not.toMatch(/totally unexpected/i);
  });

  // Regression test: a Storage RLS violation was previously classified as
  // 'session_expired', which queryClient.ts treats as grounds to force a
  // sign-out — so a single rejected photo upload silently logged the user
  // out and bounced them back through onboarding ("session expired" on
  // every arrival). It's a retryable server-side problem, not proof the
  // session is invalid, so it must never trigger a sign-out.
  it('classifies a Storage row-level security violation as a retryable server_error, not session_expired', () => {
    const error = new StorageApiError('new row violates row-level security policy for table "objects"', 403, '403');

    const result = mapToAppError(error);

    expect(result.kind).toBe('server_error');
    expect(result.message).not.toMatch(/row-level security/i);
  });

  // Regression test: unmatched AuthApiError/AuthError codes leaked the raw
  // GoTrue message straight into the UI instead of the generic copy.
  it('never leaks the raw message for an unmatched AuthApiError', () => {
    const error = new AuthApiError('some obscure internal gotrue detail', 400, 'weird_unmapped_code');

    const result = mapToAppError(error);

    expect(result.kind).toBe('unknown');
    expect(result.message).not.toMatch(/obscure internal gotrue/i);
  });

  it('classifies a 5xx Storage error as server_error', () => {
    const error = new StorageApiError('Internal server error', 500, '500');

    expect(mapToAppError(error).kind).toBe('server_error');
  });

  it('falls back to unknown for non-Error values', () => {
    expect(mapToAppError('a plain string').kind).toBe('unknown');
    expect(mapToAppError(null).kind).toBe('unknown');
    expect(mapToAppError(undefined).kind).toBe('unknown');
  });
});
