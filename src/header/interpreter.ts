import { parse } from 'cache-parser';
import { Header } from '../util/headers';
import type { HeadersInterpreter } from './types';

export const defaultHeaderInterpreter: HeadersInterpreter = (headers) => {
  if (!headers) return undefined;

  const cacheControl = headers[Header.CacheControl];

  if (cacheControl) {
    const { noCache, noStore, mustRevalidate, maxAge, immutable } = parse(cacheControl);

    // Header told that this response should not be cached.
    if (noCache || noStore) {
      return false;
    }

    if (immutable) {
      // 1 year is sufficient, as Infinity may cause more problems.
      // It might not be the best way, but a year is better than none.
      return 1000 * 60 * 60 * 24 * 365;
    }

    // Already out of date, for cache can be saved, but must be requested again
    if (mustRevalidate) {
      return 0;
    }

    if (maxAge) {
      const age = headers[Header.Age];

      if (!age) {
        return maxAge * 1000;
      }

      return (maxAge - Number(age)) * 1000;
    }
  }

  const expires = headers[Header.Expires];

  if (expires) {
    const milliseconds = Date.parse(expires) - Date.now();
    return milliseconds >= 0 ? milliseconds : false;
  }

  return undefined;
};
