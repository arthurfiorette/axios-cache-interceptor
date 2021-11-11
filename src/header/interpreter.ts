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

  const ageHeader = headers?.[Header.Age];
  const maxAgeSeconds = maxAge * 1000;

  if (!ageHeader) {
    return maxAgeSeconds;
  }

  const age = parseInt(ageHeader, 10);
  return age < 0 ? maxAgeSeconds : maxAgeSeconds - age;
};

const interpretExpires: HeaderInterpreter = (headers) => {
  const expires = headers?.[Header.Expires];

  if (!expires) {
    return undefined;
  }

  const milliseconds = Date.parse(expires) - Date.now();

  return milliseconds >= 0 ? milliseconds : false;
};
