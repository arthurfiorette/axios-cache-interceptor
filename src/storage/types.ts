export type CachedResponse = {
  data?: any;
  headers: Record<string, string>;
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

export type LoadingStorageValue = {
  /**
   * Only present if the previous state was `stale`. So, in case the new response comes
   * without a value, this data is used
   */
  data?: CachedResponse;
  ttl?: number;

  /** Defined when the state is cached */
  createdAt?: undefined;
  state: 'loading';
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
   * Returns the value for the given key. This method does not have to make checks for
   * cache invalidation or etc. It just return what was previous saved, if present.
   */
  find: (key: string) => Promise<StorageValue | undefined>;

  /**
   * Sets a new value for the given key
   *
   * Use CacheStorage.remove(key) to define a key to 'empty' state.
   */
  set: (key: string, value: NotEmptyStorageValue) => Promise<void>;

  /** Removes the value for the given key */
  remove: (key: string) => Promise<void>;

  /** Returns the value for the given key. This method make checks for cache invalidation or etc. */
  get: (key: string) => Promise<StorageValue>;
};
