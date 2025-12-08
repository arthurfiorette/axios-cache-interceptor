import { Result } from 'try';
import { buildStorage, canRemoveStorageEntry } from './build.js';
import type { StorageValue } from './types.js';

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
 * @param {number} maxStaleAge The maximum age in milliseconds a stale entry can stay
 *   in the storage before being removed. Otherwise, stale-able entries would stay
 *   indefinitely causing a memory leak eventually. 1 hour (3_600_000) is default
 */
export function buildWebStorage(
  storage: Storage,
  prefix = 'axios-cache-',
  maxStaleAge: number = 60 * 60 * 1000
) {
  function save(key: string, value: StorageValue) {
    storage.setItem(prefix + key, JSON.stringify(value));
  }

  return buildStorage({
    clear: () => {
      for (const key in storage) {
        if (key.startsWith(prefix)) {
          storage.removeItem(key);
        }
      }
    },

    find: (key) => {
      const json = storage.getItem(prefix + key);
      return json ? (JSON.parse(json) as StorageValue) : undefined;
    },

    remove: (key) => {
      storage.removeItem(prefix + key);
    },

    set: (key, value) => {
      const result = Result.try(save, key, value);

      if (result.ok) {
        return;
      }

      // we cannot hide non quota errors
      if (!isDomQuotaExceededError(result.error)) {
        throw result.error;
      }

      const allValues: [string, StorageValue][] = Object.entries(storage as Record<string, string>)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => [key, JSON.parse(value) as StorageValue]);

      // Remove all expired values
      for (const [key, value] of allValues) {
        if (canRemoveStorageEntry(value, maxStaleAge)) {
          storage.removeItem(key);
        }
      }

      // Try save again after removing expired values
      const retry = Result.try(save, key, value);

      if (retry.ok) {
        return;
      }

      // we cannot hide non quota errors
      if (!isDomQuotaExceededError(retry.error)) {
        throw retry.error;
      }

      // Storage still full, try removing the oldest value until it can be saved

      const descItems = allValues.sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));

      // Keep looping until all items are removed or the save works
      for (const item of descItems) {
        storage.removeItem(item[0]);

        const lastTry = Result.try(save, key, value);

        if (lastTry.ok) {
          return;
        }

        // we cannot hide non quota errors
        if (!isDomQuotaExceededError(lastTry.error)) {
          throw lastTry.error;
        }
      }

      // Could not save even after removing all items, just ignore since its
      // a storage quota issue.
    }
  });
}

function isDomQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    // https://stackoverflow.com/a/23375082
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.name === 'QUOTA_EXCEEDED_ERR')
  );
}
