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
 */
export function buildWebStorage(storage: Storage, prefix = '') {
  return buildStorage({
    find: (key) => {
      const json = storage.getItem(prefix + key);
      return json ? JSON.parse(json) : undefined;
    },
    set: (key, value) => void storage.setItem(prefix + key, JSON.stringify(value)),
    remove: (key) => void storage.removeItem(prefix + key)
  });
}
