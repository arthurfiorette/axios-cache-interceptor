import { parse } from 'cache-parser';
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

/** Returns true if this has sufficient properties to stale instead of expire. */
export function canStale(value: CachedStorageValue): boolean {
  const headers = value.data.headers;
  const { mustRevalidate } = parse(String(headers[Header.CacheControl]));

  return (
    (Header.ETag in headers ||
      Header.LastModified in headers ||
      Header.XAxiosCacheEtag in headers ||
      Header.XAxiosCacheStaleIfError in headers ||
      Header.XAxiosCacheLastModified in headers) &&
    !mustRevalidate
  );
}

/**
 * Checks if the provided cache is expired. You should also check if the cache
 * {@link canStale}
 */
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
   * @see https://axios-cache-interceptor.js.org/guide/storages#buildstorage
   */
  find: (
    key: string,
    currentRequest?: CacheRequestConfig
  ) => MaybePromise<StorageValue | undefined>;
};

/**
 * All integrated storages are wrappers around the `buildStorage` function. External
 * libraries use it and if you want to build your own, `buildStorage` is the way to go!
 *
 * The exported `buildStorage` function abstracts the storage interface and requires a
 * super simple object to build the storage.
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
 *
 * @see https://axios-cache-interceptor.js.org/guide/storages#buildstorage
 */
export function buildStorage({ set, find, remove }: BuildStorage): AxiosStorage {
  return {
    //@ts-expect-error - we don't want to expose this
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
