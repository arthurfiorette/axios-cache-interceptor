import type { CacheAxiosResponse } from '../cache/axios';
import type { CachePredicate } from './types';

/** Tests an response against a {@link CachePredicateObject}. */
export function testCachePredicate<R = unknown, D = unknown>(
  response: CacheAxiosResponse<R, D>,
  predicate: CachePredicate<R, D>
) {
  if (typeof predicate === 'function') {
    return predicate(response);
  }

  const { statusCheck, responseMatch, containsHeaders } = predicate;

  if (
    (statusCheck && !statusCheck(response.status)) ||
    (responseMatch && !responseMatch(response))
  ) {
    return false;
  }

  if (containsHeaders) {
    for (const header in containsHeaders) {
      const predicate = containsHeaders[header];

      if (
        predicate &&
        !predicate(
          // Axios uses lowercase headers, but if for some reason it doesn't, we should
          // still be able to match.
          response.headers[header.toLowerCase()] ?? response.headers[header]
        )
      ) {
        return false;
      }
    }
  }

  return true;
}
