import { buildStorage, canStale, isExpired } from './build';
import type { StorageValue } from './types';

/**
 * Creates a simple storage. You can persist his data by using `sessionStorage` or
 * `localStorage` with it.
 *
 * **ImplNote**: Without polyfill, this storage only works on browser environments.
 *
 * @example
 *
 * ```js
 * const fromLocalStorage = buildWebStorage(localStorage);
 * const fromSessionStorage = buildWebStorage(sessionStorage);
 *
 * const myStorage = new Storage();
 * const fromMyStorage = buildWebStorage(myStorage);
 * ```
 *
 * @param storage The type of web storage to use. localStorage or sessionStorage.
 * @param prefix The prefix to index the storage. Useful to prevent collision between
 *   multiple places using the same storage.
 */
export function buildWebStorage(storage: Storage, prefix = '') {
  return buildStorage({
    find: (key) => {
      const json = storage.getItem(prefix + key);
      return json ? (JSON.parse(json) as StorageValue) : undefined;
    },

    remove: (key) => {
      storage.removeItem(prefix + key);
    },

    set: (key, value) => {
      const save = () => storage.setItem(prefix + key, JSON.stringify(value));

      try {
        return save();
      } catch (error) {
        const allValues: [string, StorageValue][] = Object.entries(
          storage as Record<string, string>
        )
          .filter(([key]) => key.startsWith(prefix) && storage.getItem(key))
          .map(([key, val]) => [key, JSON.parse(val) as StorageValue]);

        // Remove all expired values
        for (const [prefixedKey, value] of allValues) {
          if (value.state === 'cached' && isExpired(value) && !canStale(value)) {
            storage.removeItem(prefixedKey);
          }
        }

        // Try save again after removing expired values
        try {
          return save();
        } catch (_) {
          // Storage still full, try removing the oldest value until it can be saved

          // Descending sort by createdAt
          const sortedItems = allValues.sort(
            ([, valueA], [, valueB]) => (valueA.createdAt || 0) - (valueB.createdAt || 0)
          );

          for (const [prefixedKey] of sortedItems) {
            storage.removeItem(prefixedKey);

            try {
              return save();
            } catch (_) {
              // This key didn't free all the required space
            }
          }
        }

        // Clear the cache for the specified key
        storage.removeItem(prefix + key);
      }
    }
  });
}
