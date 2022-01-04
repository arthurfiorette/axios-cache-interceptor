import { Header } from '../util/headers';
import type { AxiosStorage, StaleStorageValue } from './types';

const storage = Symbol();

/** Returns true if the provided object was created from {@link buildStorage} function. */
export const isStorage = (obj: any): obj is AxiosStorage => !!obj && !!obj[storage];

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
export function buildStorage({
  set,
  find,
  remove
}: Omit<AxiosStorage, 'get'>): AxiosStorage {
  return {
    //@ts-expect-error - we don't want to expose this
    [storage]: 1,
    set,
    find,
    remove,
    get: async (key) => {
      const value = await find(key);

      if (!value) {
        return { state: 'empty' };
      }

      if (
        // Not cached or fresh value
        value.state !== 'cached' ||
        value.createdAt + value.ttl > Date.now()
      ) {
        return value;
      }

      if (
        value.data.headers &&
        (Header.ETag in value.data.headers ||
          Header.LastModified in value.data.headers ||
          Header.XAxiosCacheEtag in value.data.headers ||
          Header.XAxiosCacheLastModified in value.data.headers)
      ) {
        const stale: StaleStorageValue = {
          data: value.data,
          state: 'stale',
          createdAt: value.createdAt
        };
        await set(key, stale);
        return stale;
      }

      await remove(key);
      return { state: 'empty' };
    }
  };
}
