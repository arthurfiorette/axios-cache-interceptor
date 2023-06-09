import { parse } from 'cache-parser';
import { Header } from './headers';
import type { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  if (!headers) return 'not enough headers';

  const cacheControl: unknown = headers[Header.CacheControl];

  if (cacheControl) {
    const { noCache, noStore, maxAge, maxStale, immutable, staleWhileRevalidate } = parse(
      String(cacheControl)
    );

    // Header told that this response should not be cached.
    if (noCache || noStore) {
      return 'dont cache';
    }

    if (immutable) {
      // 1 year is sufficient, as Infinity may cause problems with certain storages.
      // It might not be the best way, but a year is better than none. Facebook shows
      // that a browser session stays at the most 1 month.
      return {
        cache: 1000 * 60 * 60 * 24 * 365
      };
    }

    if (maxAge !== undefined) {
      const age: unknown = headers[Header.Age];

      return {
        cache: age
          ? // If age is present, we must subtract it from maxAge
            (maxAge - Number(age)) * 1000
          : maxAge * 1000,
        // Already out of date, must be requested again
        stale:
          // I couldn't find any documentation about who should be used, as they
          // are not meant to overlap each other. But, as we cannot request in the
          // background, as the stale-while-revalidate says, and we just increase
          // its staleTtl when its present, max-stale is being preferred over
          // stale-while-revalidate.
          maxStale !== undefined
            ? maxStale * 1000
            : staleWhileRevalidate !== undefined
            ? staleWhileRevalidate * 1000
            : undefined
      };
    }
  }

  const expires: unknown = headers[Header.Expires];

  if (expires) {
    const milliseconds = Date.parse(String(expires)) - Date.now();
    return milliseconds >= 0 ? { cache: milliseconds } : 'dont cache';
  }

  return 'not enough headers';
};
