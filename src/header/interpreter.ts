import { parse } from '@tusbar/cache-control';
import type { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  const cacheControl = headers?.['cache-control'];

  if (!cacheControl) {
    // Checks if Expires header is present
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
    const expires = headers?.['expires'];

    if (expires) {
      const milliseconds = Date.parse(expires) - Date.now();

      if (milliseconds > 0) {
        return milliseconds;
      } else {
        return false;
      }
    }

    return undefined;
  }

  const { noCache, noStore, mustRevalidate, maxAge } = parse(cacheControl);

  // Header told that this response should not be cached.
  if (noCache || noStore) {
    return false;
  }

  // set ttl to 1ms, enabling use of etag / last-modified revalidation
  if (mustRevalidate) {
    return 1;
  }

  if (!maxAge) {
    return undefined;
  }

  return maxAge * 1000;
};
