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

function hasUniqueIdentifierHeader(
  value: CachedStorageValue | StaleStorageValue
): boolean {
  const headers = value.data.headers;

  return (
    Header.ETag in headers ||
    Header.LastModified in headers ||
    Header.XAxiosCacheEtag in headers ||
    Header.XAxiosCacheLastModified in headers
  );
}

/** Returns true if this has sufficient properties to stale instead of expire. */
export function canStale(value: CachedStorageValue): boolean {
  // Must revalidate is a special case and should not be staled
  if (
    String(value.data.headers[Header.CacheControl])
      // We could use cache-control's parse function, but this is way faster and simpler
      .includes('must-revalidate')
  ) {
    return false;
  }

  if (hasUniqueIdentifierHeader(value)) {
    return true;
  }

  return (
    value.state === 'cached' &&
    value.staleTtl !== undefined &&
    // Only allow stale values after the ttl is already in the past and the staleTtl is in the future.
    // In cases that just createdAt + ttl > Date.now(), isn't enough because the staleTtl could be <= 0.
    // This logic only returns true when Date.now() is between the (createdAt + ttl) and (createdAt + ttl + staleTtl).
    // Following the example below:
    // |--createdAt--:--ttl--:---staleTtl--->
    // [        past        ][now is in here]
    Math.abs(Date.now() - (value.createdAt + value.ttl)) <= value.staleTtl
  );
}

/**
 * Checks if the provided cache is expired. You should also check if the cache
 * {@link canStale}
 */
export function isExpired(value: CachedStorageValue | StaleStorageValue): boolean {
  return value.ttl !== undefined && value.createdAt + value.ttl <= Date.now();
}

export interface BuildStorage extends Omit<AxiosStorage, 'get'> {
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
}

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
      let value = await find(key, config);

      if (!value) {
        return { state: 'empty' };
      }

      if (value.state === 'empty' || value.state === 'loading') {
        return value;
      }

      // Handle cached values
      if (value.state === 'cached') {
        if (!isExpired(value)) {
          return value;
        }

        // Tries to stale expired value
        if (!canStale(value)) {
          await remove(key, config);
          return { state: 'empty' };
        }

        value = {
          state: 'stale',
          createdAt: value.createdAt,
          data: value.data,
          ttl: value.staleTtl !== undefined ? value.staleTtl + value.ttl : undefined
        };

        await set(key, value, config);
      }

      // A second check in case the new stale value was created already expired.
      if (!isExpired(value)) {
        return value;
      }

      if (hasUniqueIdentifierHeader(value)) {
        return value;
      }

      await remove(key, config);
      return { state: 'empty' };
    }
  };
}
