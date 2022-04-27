import type { AxiosResponseHeaders } from 'axios';
import type { MaybePromise } from '../util/types';

export type CachedResponse = {
  data?: unknown;
  headers: AxiosResponseHeaders;
  status: number;
  statusText: string;
};

/** The value returned for a given key. */
export type StorageValue =
  | StaleStorageValue
  | CachedStorageValue
  | LoadingStorageValue
  | EmptyStorageValue;

export type NotEmptyStorageValue = Exclude<StorageValue, EmptyStorageValue>;

export type StaleStorageValue = {
  data: CachedResponse;
  ttl?: undefined;
  createdAt: number;
  state: 'stale';
};

export type CachedStorageValue = {
  data: CachedResponse;
  /** The number in milliseconds to wait after createdAt before the value is considered stale. */
  ttl: number;
  createdAt: number;
  state: 'cached';
};

export type LoadingStorageValue =
  | {
      data?: undefined;
      ttl?: undefined;
      createdAt?: undefined;
      state: 'loading';
      previous: 'empty';
    }
  | {
      state: 'loading';
      data: CachedResponse;
      ttl?: undefined;
      createdAt: number;
      previous: 'stale';
    };

export type EmptyStorageValue = {
  data?: undefined;
  ttl?: undefined;

  /** Defined when the state is cached */
  createdAt?: undefined;
  state: 'empty';
};

/**
 * A storage implementation that stores data in memory.
 *
 * **You can create yours with {@link buildStorage} function**
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
export type AxiosStorage = {
  /**
   * Sets a new value for the given key
   *
   * Use CacheStorage.remove(key) to define a key to 'empty' state.
   */
  set: (key: string, value: NotEmptyStorageValue) => MaybePromise<void>;

  /** Removes the value for the given key */
  remove: (key: string) => MaybePromise<void>;

  /** Returns the value for the given key. This method make checks for cache invalidation or etc. */
  get: (key: string) => MaybePromise<StorageValue>;
};
