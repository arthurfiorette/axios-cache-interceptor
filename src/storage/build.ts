import type { CacheRequestConfig } from '../cache/axios';
import { Header } from '../header/headers';
import type { MaybePromise } from '../util/types';
import type {
  AxiosStorage,
  CachedStorageValue,
  StaleStorageValue,
  StorageValue
} from './types';

/** Returns true if the provided object was created from {@link buildStorage} function. */
export const isStorage = (obj: unknown): obj is AxiosStorage =>
  !!obj && !!(obj as Record<string, boolean>)['is-storage'];

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
   *
   * @param key The key to look for
   * @param currentRequest The current {@link CacheRequestConfig}, if any
   */
  find: (
    key: string,
    currentRequest?: CacheRequestConfig
  ) => MaybePromise<StorageValue | undefined>;
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
    //@ts-expect-error - we don't want to expose thi
    ['is-storage']: 1,
    set,
    remove,
    get: async (key, config) => {
      const value = await find(key, config);

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

        await set(key, stale, config);
        return stale;
      }

      await remove(key, config);
      return { state: 'empty' };
    }
  };
}
