import type { CacheAxiosResponse } from '../cache/axios';
import type { CachePredicate } from './types';

/** Tests an response against a {@link CachePredicateObject}. */
export async function testCachePredicate<R = unknown, D = unknown>(
  response: CacheAxiosResponse<R, D>,
  predicate: CachePredicate<R, D>
): Promise<boolean> {
  if (typeof predicate === 'function') {
    return predicate(response);
  }

  const { statusCheck, responseMatch, containsHeaders } = predicate;

  if (
    (statusCheck && !(await statusCheck(response.status))) ||
    (responseMatch && !(await responseMatch(response)))
  ) {
    return false;
  }

  if (containsHeaders) {
    for (const header in containsHeaders) {
      const predicate = containsHeaders[header];

      if (
        predicate &&
        !(await predicate(
          // Axios uses lowercase headers, but if for some reason it doesn't, we should
          // still be able to match.
          response.headers[header.toLowerCase()] ?? response.headers[header]
        ))
      ) {
        return false;
      }
    }
  }

  return true;
}
