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

/**
 * Determines whether a given URL matches a specified pattern, which can be either a string or a regular expression.
 *
 * @param matchPattern - The pattern to match against
 *   - If it's a regular expression, it will be reset to ensure consistent behavior for stateful regular expressions.
 *   - If it's a string, the function checks if the URL contains the string.
 * @param configUrl - The URL to test against the provided pattern; normally `config.url`.
 * @returns `true` if the `configUrl` matches the `matchPattern`
 */
export function regexOrStringMatch(matchPattern: string | RegExp, configUrl: string) {
  if (matchPattern instanceof RegExp) {
    matchPattern.lastIndex = 0; // Reset the regex to ensure consistent matching
    return matchPattern.test(configUrl);
  }

  return configUrl.includes(matchPattern);
}
