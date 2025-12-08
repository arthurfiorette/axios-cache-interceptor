import { buildStorage, canRemoveStorageEntry, storageEntriesSorter } from './build.js';
import type { AxiosStorage, StorageValue } from './types.js';

/* c8 ignore start */
/**
 * Clones an object using the structured clone algorithm if available, otherwise it uses
 * JSON.parse(JSON.stringify(value)).
 */
const clone: <T>(value: T) => T =
  // https://caniuse.com/mdn-api_structuredclone (10/18/2023 92.51%)
  typeof structuredClone === 'function'
    ? structuredClone
    : (value) => JSON.parse(JSON.stringify(value));
/* c8 ignore stop */

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
 * @param {boolean | 'double'} cloneData Use `true` if the data returned by `find()`
 *   should be cloned to avoid mutating the original data outside the `set()` method. Use
 *   `'double'` to also clone before saving value in storage using `set()`. Disabled is
 *   default
 * @param {number | false} cleanupInterval The interval in milliseconds to run a
 *   setInterval job of cleaning old entries. If false, the job will not be created.
 *   5 minutes (300_000) is default
 * @param {number | false} maxEntries The maximum number of entries to keep in the
 *   storage. Its hard to determine the size of the entries, so a smart FIFO order is used
 *   to determine eviction. If false, no check will be done and you may grow up memory
 *   usage. 1024 is default
 * @param {number} maxStaleAge The maximum age in milliseconds a stale entry can stay
 *   in the storage before being removed. Otherwise, stale-able entries would stay
 *   indefinitely causing a memory leak eventually. 1 hour (3_600_000) is default
 */
export function buildMemoryStorage(
  cloneData: boolean | 'double' = false,
  cleanupInterval: number | false = 5 * 60 * 1000,
  maxEntries: number | false = 1024,
  maxStaleAge: number = 60 * 60 * 1000
) {
  function sortedEntries() {
    return Array.from(storage.data.entries()).sort(storageEntriesSorter);
  }

  const storage = buildStorage({
    set: (key, value) => {
      // More entries than allowed, evict oldest ones
      if (maxEntries && storage.data.size >= maxEntries) {
        storage.cleanup();

        if (storage.data.size < maxEntries) {
          for (const [key] of sortedEntries()) {
            storage.data.delete(key);

            if (storage.data.size < maxEntries) {
              break;
            }
          }
        }
      }

      // Clone the value before storing to prevent future mutations
      // from affecting cached data.
      storage.data.set(key, cloneData === 'double' ? clone(value) : value);
    },

    remove: (key) => {
      storage.data.delete(key);
    },

    find: (key) => {
      const value = storage.data.get(key);
      return cloneData && value !== undefined ? clone(value) : value;
    },

    clear: () => {
      storage.data.clear();
    }
  }) as MemoryStorage;

  storage.data = new Map();

  // When this program gets running for more than the specified interval, there's a good
  // chance of it being a long-running process or at least have a lot of entries. Therefore,
  // "faster" loop is more important than code readability.
  storage.cleanup = () => {
    for (const [key, value] of sortedEntries()) {
      if (canRemoveStorageEntry(value, maxStaleAge)) {
        storage.data.delete(key);
      }
    }
  };

  if (cleanupInterval) {
    storage.cleaner = setInterval(storage.cleanup, cleanupInterval);

    // Attempt to unref the interval to not block Node.js from exiting
    if (typeof storage.cleaner === 'object' && 'unref' in storage.cleaner) {
      storage.cleaner.unref();
    }
  }

  return storage;
}

export interface MemoryStorage extends AxiosStorage {
  data: Map<string, StorageValue>;
  /** The job responsible to cleaning old entries */
  cleaner: ReturnType<typeof setInterval>;
  /** Tries to remove any invalid entry from the memory */
  cleanup: () => void;
}
