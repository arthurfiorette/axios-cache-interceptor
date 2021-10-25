import type { StorageValue } from './types';

/**
 * Returns true if a storage value can still be used by checking his
 * createdAt and ttl values.
 *
 * @param value The stored value
 * @returns True if the cache can still be used
 */
export function isCacheValid(value: StorageValue): boolean {
  if (!value) {
    return false;
  }

  if (value.state !== 'cached') {
    return false;
  }

  return value.createdAt + value.ttl > Date.now();
}
