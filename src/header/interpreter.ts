import { parse } from 'cache-parser';
import { Header } from './headers';
import type { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  if (!headers) return 'not enough headers';

  const cacheControl: unknown = headers[Header.CacheControl];

  if (cacheControl) {
    const { noCache, noStore, maxAge, immutable } = parse(String(cacheControl));

    // Header told that this response should not be cached.
    if (noCache || noStore) {
      return 'dont cache';
    }

    if (immutable) {
      // 1 year is sufficient, as Infinity may cause problems with certain storages.
      // It might not be the best way, but a year is better than none.
      return 1000 * 60 * 60 * 24 * 365;
    }

    if (maxAge !== undefined) {
      const age: unknown = headers[Header.Age];

      if (!age) {
        return maxAge * 1000;
      }

      return (maxAge - Number(age)) * 1000;
    }
  }

  const expires: unknown = headers[Header.Expires];

  if (expires) {
    const milliseconds = Date.parse(String(expires)) - Date.now();
    return milliseconds >= 0 ? milliseconds : 'dont cache';
  }

  return 'not enough headers';
};
