import { parse } from 'cache-parser';
import { Header } from './headers';
import type { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  if (!headers) return 'not enough headers';

  const cacheControl: unknown = headers[Header.CacheControl];

  if (cacheControl) {
    const { noCache, noStore, mustRevalidate, maxAge, immutable, staleWhileRevalidate } =
      parse(String(cacheControl));
    const staleTtl = staleWhileRevalidate !== undefined ? staleWhileRevalidate * 1000 : 0;

    // Header told that this response should not be cached.
    if (noCache || noStore) {
      return 'dont cache';
    }

    if (immutable) {
      // 1 year is sufficient, as Infinity may cause problems with certain storages.
      // It might not be the best way, but a year is better than none.
      return { cacheTtl: 1000 * 60 * 60 * 24 * 365 };
    }

    // Already out of date, for cache can be saved, but must be requested again
    if (mustRevalidate) {
      return { cacheTtl: 0, staleTtl };
    }

    if (maxAge !== undefined) {
      const age: unknown = headers[Header.Age];

      if (!age) {
        return { cacheTtl: maxAge * 1000, staleTtl };
      }

      return { cacheTtl: (maxAge - Number(age)) * 1000, staleTtl };
    }
  }

  const expires: unknown = headers[Header.Expires];

  if (expires) {
    const milliseconds = Date.parse(String(expires)) - Date.now();
    return milliseconds >= 0 ? { cacheTtl: milliseconds } : 'dont cache';
  }

  return 'not enough headers';
};
