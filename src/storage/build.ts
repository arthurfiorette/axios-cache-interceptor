import { Header } from '../header/headers';
import type { MaybePromise } from '../util/types';
import type { AxiosStorage, StaleStorageValue, StorageValue } from './types';

const storage = Symbol();

/** Returns true if the provided object was created from {@link buildStorage} function. */
export const isStorage = (obj: unknown): obj is AxiosStorage =>
  !!obj && !!(obj as Record<symbol, number>)[storage];

export type BuildStorage = Omit<AxiosStorage, 'get'> & {
  /**
   * Returns the value for the given key. This method does not have to make checks for
   * cache invalidation or etc. It just return what was previous saved, if present.
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
        value.createdAt + value.ttl > Date.now()
      ) {
        return value;
      }

      if (
        value.data.headers &&
        // Any header below allows the response to stale
        (Header.ETag in value.data.headers ||
          Header.LastModified in value.data.headers ||
          Header.XAxiosCacheEtag in value.data.headers ||
          Header.XAxiosCacheStaleIfError in value.data.headers ||
          Header.XAxiosCacheLastModified in value.data.headers)
      ) {
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
