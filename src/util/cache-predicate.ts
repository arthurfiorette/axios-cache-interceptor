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
   * Matches if the response header container all keys.
   * A tuple also checks for values.
   * Can also be a predicate.
   */
  containsHeaders?: Record<string, true | string | ((header: string) => boolean)>;

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
    for (const [headerName, value] of Object.entries(containsHeader)) {
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

  if (responseMatch) {
    if (!responseMatch(response.data)) {
      return false;
    }
  }

  return true;
}
