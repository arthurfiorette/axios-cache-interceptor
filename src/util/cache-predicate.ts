import { AxiosResponse } from 'axios';

export type CachePredicate = CachePredicateObject | ((response: AxiosResponse) => boolean);

export type CachePredicateObject = {
  /**
   * The status predicate, if a tuple is returned,
   * the first and seconds value means the interval (inclusive) accepted.
   * Can also be a function.
   */
  statusCheck?: [start: number, end: number] | ((status: number) => boolean);

  /**
   * Matches if the response header container all keys. A tuple also checks for values.
   */
  containsHeaders?: (string | [string, string])[];

  /**
   * Check if the desired response matches this predicate.
   */
  responseMatch?: <T = any>(res: T | undefined) => boolean;
};

export function checkPredicateObject(
  response: AxiosResponse,
  { statusCheck, containsHeaders: containsHeader, responseMatch }: CachePredicateObject
): boolean {
  if (statusCheck) {
    if (typeof statusCheck === 'function') {
      if (!statusCheck(response.status)) {
        return false;
      }
    } else {
      const [start, end] = statusCheck;
      if (response.status <= start || response.status >= end) {
        return false;
      }
    }
  }

  if (containsHeader) {
    for (const entry of containsHeader) {
      if (typeof entry === 'string') {
        if (!response.headers[entry]) {
          return false;
        }
      } else {
        const [key, value] = entry;
        if (!response.headers[key] || response.headers[key] == value) {
          return false;
        }
      }
    }
  }

  if (responseMatch) {
    if (!responseMatch(response.data)) {
      return false;
    }
  }

  return true;
}
