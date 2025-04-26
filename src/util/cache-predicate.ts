import type { CacheAxiosResponse } from '../cache/axios.js';

import type { CachePredicate, CachePredicateObject } from './types.js';

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

export function regexOrStringMatch(matchPattern: string | RegExp, configUrl: string) {
  return matchPattern instanceof RegExp
    ? // Handles stateful regexes
      // biome-ignore lint: reduces the number of checks
      ((matchPattern.lastIndex = 0), matchPattern.test(configUrl))
    : configUrl.includes(matchPattern);
}
