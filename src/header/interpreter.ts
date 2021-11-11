import { parse } from '@tusbar/cache-control';
import { Header } from '../util/headers';
import type { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  const cacheControl = headers?.[Header.CacheControl];

  if (!cacheControl) {
    return interpretExpires(headers);
  }

  const { noCache, noStore, mustRevalidate, maxAge } = parse(cacheControl);

  // Header told that this response should not be cached.
  if (noCache || noStore) {
    return false;
  }

  // Already out of date, for cache can be saved, but must be requested again
  if (mustRevalidate) {
    return 0;
  }

  if (!maxAge) {
    return undefined;
  }

  const age = headers?.[Header.Age];
  const maxAgeSeconds = maxAge * 1000;

  if (!age) {
    return maxAgeSeconds;
  }

  return maxAgeSeconds - Number(age) * 1000;
};

const interpretExpires: HeaderInterpreter = (headers) => {
  const expires = headers?.[Header.Expires];

  if (!expires) {
    return undefined;
  }

  const milliseconds = Date.parse(expires) - Date.now();

  return milliseconds >= 0 ? milliseconds : false;
};
