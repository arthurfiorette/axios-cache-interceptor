import type { CacheAxiosResponse } from '../cache/axios';
import type { CacheProperties } from '../cache/cache';
import type { CachePredicateObject } from './types';

/** Returns true if the response should be cached */
export function shouldCacheResponse<R, D>(
  response: CacheAxiosResponse<R, D>,
  { cachePredicate }: CacheProperties
) {
  if (typeof cachePredicate === 'function') {
    return cachePredicate(response);
  }

  return isCachePredicateValid(response, cachePredicate);
}

export function isCachePredicateValid<R, D>(
  response: CacheAxiosResponse<R, D>,
  { statusCheck, containsHeaders, responseMatch }: CachePredicateObject<R, D>
): boolean {
  if (statusCheck) {
    if (typeof statusCheck === 'function') {
      if (!statusCheck(response.status)) {
        return false;
      }
    } else {
      const [start, end] = statusCheck;
      if (
        response.status < start || //
        response.status > end
      ) {
        return false;
      }
    }
  }

  if (containsHeaders) {
    for (const headerName in containsHeaders) {
      const value = containsHeaders[headerName as keyof typeof containsHeaders];
      const header = response.headers[headerName];

      // At any case, if the header is not found, the predicate fails.
      if (!header) {
        return false;
      }

      switch (typeof value) {
        case 'string':
          if (header != value) {
            return false;
          }
          break;
        case 'function':
          if (!value(header)) {
            return false;
          }
          break;
      }
    }
  }

  if (responseMatch && !responseMatch(response)) {
    return false;
  }

  return true;
}
