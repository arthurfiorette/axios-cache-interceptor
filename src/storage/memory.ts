import type { AxiosStorage } from '..';
import { buildStorage } from './build';
import type { StorageValue } from './types';

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
 */
export function buildMemoryStorage() {
  const storage = buildStorage({
    find: (key) => storage.data[key],
    set: (key, value) => {
      storage.data[key] = value;
    },
    remove: (key) => {
      delete storage.data[key];
    }
  }) as MemoryStorage;

  storage.data = Object.create(null) as Record<string, StorageValue>;

  return storage;
}

export type MemoryStorage = AxiosStorage & {
  data: Record<string, StorageValue>;
};
