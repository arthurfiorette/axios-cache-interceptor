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
