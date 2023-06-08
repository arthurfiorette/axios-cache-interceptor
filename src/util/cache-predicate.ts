import type { CacheAxiosResponse } from '../cache/axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CachePredicate, CachePredicateObject } from './types';

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
    for (const [header, predicate] of Object.entries(containsHeaders)) {
      if (
        !(await predicate(
          // Avoid bugs in case the header is not in lower case
          response.headers[header.toLowerCase()] ?? response.headers[header]
        ))
      ) {
        return false;
      }
    }
  }

  return true;
}
