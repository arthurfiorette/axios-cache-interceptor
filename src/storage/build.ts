import { Header } from '../header/headers';
import type { MaybePromise } from '../util/types';
import type {
  AxiosStorage,
  CachedStorageValue,
  StaleStorageValue,
  StorageValue
} from './types';

const storage = Symbol();

/** Returns true if the provided object was created from {@link buildStorage} function. */
export const isStorage = (obj: unknown): obj is AxiosStorage =>
  !!obj && !!(obj as Record<symbol, number>)[storage];

/** Returns true if this storage is expired, but it has sufficient properties to stale. */
export function canStale(value: CachedStorageValue): boolean {
  const headers = value.data.headers;
  return (
    Header.ETag in headers ||
    Header.LastModified in headers ||
    Header.XAxiosCacheEtag in headers ||
    Header.XAxiosCacheStaleIfError in headers ||
    Header.XAxiosCacheLastModified in headers
  );
}

/** Checks if the provided cache is expired. You should also check if the cache {@link canStale} */
export function isExpired(value: CachedStorageValue): boolean {
  return value.createdAt + value.ttl <= Date.now();
}

export type BuildStorage = Omit<AxiosStorage, 'get'> & {
  /**
   * Returns the value for the given key. This method does not have to make checks for
   * cache invalidation or anything. It just returns what was previous saved, if present.
   */
  find: (key: string) => MaybePromise<StorageValue | undefined>;
};

/**
 * Builds a custom storage.
 *
 * **Note**: You can only create an custom storage with this function.
 *
 * @example
 *
 * ```js
 * const myStorage = buildStorage({
 *   find: () => {...},
 *   set: () => {...},
 *   remove: () => {...}
 * });
 *
 * const axios = setupCache(axios, { storage: myStorage });
 * ```
 */
export function buildStorage({ set, find, remove }: BuildStorage): AxiosStorage {
  return {
    //@ts-expect-error - we don't want to expose this
    [storage]: 1,
    set,
    remove,
    get: async (key) => {
      const value = await find(key);

      if (!value) {
        return { state: 'empty' };
      }

      if (
        // Not cached or fresh value
        value.state !== 'cached' ||
        !isExpired(value)
      ) {
        return value;
      }

      if (canStale(value)) {
        const stale: StaleStorageValue = {
          state: 'stale',
          createdAt: value.createdAt,
          data: value.data
        };

        await set(key, stale);
        return stale;
      }

      await remove(key);
      return { state: 'empty' };
    }
  };
}
