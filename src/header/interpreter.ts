import { parse } from '@tusbar/cache-control';
import { HeaderInterpreter } from './types';

export const defaultHeaderInterpreter: HeaderInterpreter = (headers) => {
  const cacheControl = headers?.['Cache-Control'];

  if (!cacheControl) {
    // Checks if Expires header is present
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
    const expires = headers?.['Expires'];

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
  if (noCache || noStore || mustRevalidate) {
    return false;
  }

  if (!maxAge) {
    return undefined;
  }

  return maxAge * 1000;
};
