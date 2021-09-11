import { parse } from '@tusbar/cache-control';
import { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  const cacheControl = headers?.['cache-control'];

  if (!cacheControl) {
    return undefined;
  }

  const { noCache, noStore, maxAge } = parse(cacheControl);

  // Header told that this response should not be cached.
  if (noCache || noStore) {
    return false;
  }

  if (!maxAge) {
    return undefined;
  }

  return Date.now() + maxAge * 1000;
};
