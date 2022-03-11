import { buildStorage } from './build';
import type { AxiosStorage, StorageValue } from './types';

/**
 * Modern function to natively deep clone
 *
 * @link https://caniuse.com/mdn-api_structuredclone (07/03/2022 -> 59.4%)
 */
declare const structuredClone: (<T>(value: T) => T) | undefined;

/**
 * Creates a simple in-memory storage. This means that if you need to persist data between
 * page or server reloads, this will not help.
 *
 * This is the storage used by default.
 *
 * If you need to modify it's data, you can do by the `data` property.
 *
 * @example
 *
 * ```js
 * const memoryStorage = buildMemoryStorage();
 *
 * setupCache(axios, { storage: memoryStorage });
 *
 * // Simple example to force delete the request cache
 *
 * const { id } = axios.get('url');
 *
 * delete memoryStorage.data[id];
 * ```
 *
 * @param {boolean} cloneData If the data returned by `find()` should be cloned to avoid
 *   mutating the original data outside the `set()` method.
 */
export function buildMemoryStorage(cloneData = false) {
  const storage = buildStorage({
    set: (key, value) => {
      storage.data[key] = value;
    },

    remove: (key) => {
      delete storage.data[key];
    },

    find: (key) => {
      const value = storage.data[key];

      if (cloneData && value !== undefined) {
        /* istanbul ignore if 'only available on super recent browsers' */
        if (typeof structuredClone === 'function') {
          return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value)) as StorageValue;
      }

      return value;
    }
  }) as MemoryStorage;

  storage.data = Object.create(null) as Record<string, StorageValue>;

  return storage;
}

export type MemoryStorage = AxiosStorage & {
  data: Record<string, StorageValue>;
};
