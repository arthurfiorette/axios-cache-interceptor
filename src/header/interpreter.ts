import { parse } from 'cache-parser';
import { Header } from './headers.js';
import type { HeaderInterpreter } from './types.js';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers, location) => {
  if (!headers) return 'not enough headers';

  const cacheControl: unknown = headers[Header.CacheControl];

  if (cacheControl) {
    const cc = parse(String(cacheControl));

    if (
      // Header told that this response should not be cached.
      cc.noCache ||
      cc.noStore ||
      // Server side handling private data
      (location === 'server' && cc.private)
    ) {
      return 'dont cache';
    }

    if (cc.immutable) {
      // 1 year is sufficient, as Infinity may cause problems with certain storages.
      // It might not be the best way, but a year is better than none. Facebook shows
      // that a browser session stays at the most 1 month.
      return {
        cache: 1000 * 60 * 60 * 24 * 365
      };
    }

    if (cc.maxAge !== undefined) {
      const age: unknown = headers[Header.Age];

      return {
        cache: age
          ? // If age is present, we must subtract it from maxAge
            (cc.maxAge - Number(age)) * 1000
          : cc.maxAge * 1000,
        // Already out of date, must be requested again
        stale:
          // I couldn't find any documentation about who should be used, as they
          // are not meant to overlap each other. But, as we cannot request in the
          // background, as the stale-while-revalidate says, and we just increase
          // its staleTtl when its present, max-stale is being preferred over
          // stale-while-revalidate.
          cc.maxStale !== undefined
            ? cc.maxStale * 1000
            : cc.staleWhileRevalidate !== undefined
              ? cc.staleWhileRevalidate * 1000
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
