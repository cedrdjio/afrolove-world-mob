import { fetchWithTimeout } from '@/shared/services/supabase/client';

// Regression coverage for a bug we shipped and then had to revert: calling
// controller.abort(new Error(...)) instead of controller.abort() — RN/Hermes's
// AbortController doesn't reliably support the abort(reason) argument, so it
// must always be called with zero arguments. The timeout error message is
// synthesized separately, after the fetch rejects.
describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('calls AbortController.abort() with no arguments and rejects with a recognizable timeout message', async () => {
    jest.useFakeTimers();
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    global.fetch = jest.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('Aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    }) as unknown as typeof fetch;

    const pending = fetchWithTimeout('https://example.com');
    // Swallow the rejection for this assertion; the real expectation runs below.
    pending.catch(() => {});

    await jest.advanceTimersByTimeAsync(30_000);

    await expect(pending).rejects.toThrow('Request timed out');
    expect(abortSpy).toHaveBeenCalledWith();
  });

  it('passes through a non-timeout fetch failure unchanged', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network request failed'))) as unknown as typeof fetch;

    await expect(fetchWithTimeout('https://example.com')).rejects.toThrow('Network request failed');
  });
});
