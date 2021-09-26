import type { AxiosResponse } from 'axios';
import type { CachePredicateObject } from './types';

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
      if (
        response.status < start || //
        response.status > end
      ) {
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
