import { buildStorage, canStale, isExpired } from './build';
import type { AxiosStorage, NotEmptyStorageValue, StorageValue } from './types';

/**
 * Modern function to natively deep clone.
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
 * @param {boolean | 'double'} cloneData Use `true` if the data returned by `find()`
 *   should be cloned to avoid mutating the original data outside the `set()` method. Use
 *   `'double'` to also clone before saving value in storage using `set()`. Disabled is
 *   default
 * @param {number | false} cleanupInterval The interval in milliseconds to run a
 *   setInterval job of cleaning old entries. If false, the job will not be created.
 *   Disabled is default
 * @param {number | false} maxEntries The maximum number of entries to keep in the
 *   storage. Its hard to determine the size of the entries, so a smart FIFO order is used
 *   to determine eviction. If false, no check will be done and you may grow up memory
 *   usage. Disabled is default
 */
export function buildMemoryStorage(
  cloneData: boolean | 'double' = false,
  cleanupInterval: number | false = false,
  maxEntries: number | false = false
) {
  const storage = buildStorage({
    set: (key, value) => {
      if (maxEntries) {
        let keys = Object.keys(storage.data);

        // Tries to cleanup first
        if (keys.length >= maxEntries) {
          storage.cleanup();

          // Recalculates the keys
          keys = Object.keys(storage.data);

          // Keeps deleting until there's space
          while (keys.length >= maxEntries) {
            // There's always at least one key here, otherwise it would not be
            // in the loop.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            delete storage.data[keys.shift()!];
          }
        }
      }

      storage.data[key] =
        // Clone the value before storing to prevent future mutations
        // from affecting cached data.
        cloneData === 'double'
          ? /* c8 ignore next 3 */
            typeof structuredClone === 'function'
            ? structuredClone(value)
            : (JSON.parse(JSON.stringify(value)) as NotEmptyStorageValue)
          : value;
    },

    remove: (key) => {
      delete storage.data[key];
    },

    find: (key) => {
      const value = storage.data[key];

      /* c8 ignore next 7 */
      if (cloneData && value !== undefined) {
        if (typeof structuredClone === 'function') {
          return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value)) as StorageValue;
      }

      return value;
    }
  }) as MemoryStorage;

  storage.data = Object.create(null) as Record<string, StorageValue>;

  // When this program gets running for more than the specified interval, there's a good
  // chance of it being a long-running process or at least have a lot of entries. Therefore,
  // "faster" loop is more important than code readability.
  storage.cleanup = () => {
    const keys = Object.keys(storage.data);

    let i = -1,
      value: StorageValue,
      key: string;

    // Looping forward, as older entries are more likely to be expired
    // than newer ones.
    while (++i < keys.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (key = keys[i]!), (value = storage.data[key]!);

      if (value.state === 'empty') {
        // this storage returns void.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        storage.remove(key);
        continue;
      }

      // If the value is expired and can't be stale, remove it
      if (value.state === 'cached' && isExpired(value) && !canStale(value)) {
        // this storage returns void.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        storage.remove(key);
      }
    }
  };

  if (cleanupInterval) {
    storage.cleaner = setInterval(storage.cleanup, cleanupInterval);
  }

  return storage;
}

export interface MemoryStorage extends AxiosStorage {
  data: Record<string, StorageValue>;
  /** The job responsible to cleaning old entries */
  cleaner: ReturnType<typeof setInterval>;
  /** Tries to remove any invalid entry from the memory */
  cleanup: () => void;
}
