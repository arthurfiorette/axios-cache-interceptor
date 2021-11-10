import type { StorageValue } from './types';

/**
 * Returns true if a storage value can still be used by checking his
 * createdAt and ttl values. Returns `'unknown'` when the cache.state
 * is different from `'cached'`
 *
 * @param value The stored value
 * @returns True if the cache can still be used of falsy otherwise
 */
export function isCacheValid(value: StorageValue): boolean | 'unknown' {
  if (!value || value.state !== 'cached') {
    return 'unknown';
  }

  return value.createdAt + value.ttl > Date.now();
}

/**
 * Returns true if a storage value can be used with If-None-Match
 * / If-modified-since headers to refresh cache
 *
 * @param value The stored value
 * @returns True if the cache entry have etag / last-modified headers
 */
export function canRevalidate(value: StorageValue): boolean {
  return value.state == 'cached' &&
    (
      value.data.headers['etag'] != null
      || value.data.headers['last-modified'] != null
    );
}
