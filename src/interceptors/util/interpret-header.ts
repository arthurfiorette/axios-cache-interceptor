import { parse } from '@tusbar/cache-control';
import { AxiosResponse } from 'axios';

// response.config.cache?.maxAge || axios.defaults.cache.maxAge

/**
 * Interpret the cache control header, if present.
 *
 * @param header the header to interpret.
 * @returns false if header is not valid, undefined if the maxAge was not specified or a number in seconds from now.
 */
export function interpretCacheHeader(
  headers: AxiosResponse['headers']
): false | undefined | number {
  const cacheControl = headers['cache-control'] || '';
  const { noCache, noStore, maxAge } = parse(cacheControl);

  // Header told that this response should not be cached.
  if (noCache || noStore) {
    return false;
  }

  if (!maxAge) {
    return undefined;
  }

  return Date.now() + maxAge * 1000;
}
