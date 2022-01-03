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
  const data: Record<string, StorageValue> = {};
  const storage = buildStorage({
    find: (key) => Promise.resolve(data[key]),
    set: (key, value) => Promise.resolve(void (data[key] = value)),
    remove: (key) => Promise.resolve(void delete data[key])
  });
  return { ...storage, data };
}
