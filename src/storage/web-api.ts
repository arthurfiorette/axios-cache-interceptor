import type { StorageValue } from '..';
import { buildStorage } from './build';

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
 * @param prefix The prefix to index the storage. Useful to prevent collision between
 *   multiple places using the same storage.
 */
export function buildWebStorage(storage: Storage, prefix = '') {
  return buildStorage({
    find: (key) => {
      const json = storage.getItem(prefix + key);
      return json ? (JSON.parse(json) as StorageValue) : undefined;
    },
    set: (key, value) => {
      storage.setItem(prefix + key, JSON.stringify(value));
    },
    remove: (key) => {
      storage.removeItem(prefix + key);
    }
  });
}
