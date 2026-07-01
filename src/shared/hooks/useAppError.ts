import { useEffect, useMemo } from 'react';
import { mapToAppError, logAppErrorDetails, type AppError } from '@/shared/utils/errorMapping';

/**
 * Maps a raw mutation/query error to an AppError, memoized on the error
 * reference so a screen re-rendering while the error is still displayed
 * (animations, unrelated state changes, etc.) doesn't redo the mapping or
 * re-log the raw details every frame — calling mapToAppError directly in
 * JSX did exactly that, spamming the console/dev error overlay for as long
 * as the error stayed on screen.
 */
export function useAppError(error: unknown): AppError | null {
  const appError = useMemo(() => (error ? mapToAppError(error) : null), [error]);

  useEffect(() => {
    if (error && appError) {
      logAppErrorDetails(error, appError);
    }
  }, [error, appError]);

  return appError;
}
