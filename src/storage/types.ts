export interface CacheStorage {
  /**
   * Returns the cached value for the given key. Must handle cache
   * miss and staling by returning a new `StorageValue` with `empty` state.
   */
  get: (key: string) => Promise<StorageValue>;

  /**
   * Sets a new value for the given key
   *
   * Use CacheStorage.remove(key) to define a key to 'empty' state.
   */
  set: (key: string, value: LoadingStorageValue | CachedStorageValue) => Promise<void>;

  /**
   * Removes the value for the given key
   */
  remove: (key: string) => Promise<void>;
}

export type CachedResponse = {
  data?: any;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

/**
 * The value returned for a given key.
 */
export type StorageValue = CachedStorageValue | LoadingStorageValue | EmptyStorageValue | StaleStorageValue;

export type CachedStorageValue = {
  data: CachedResponse;
  /**
   * The number in milliseconds to wait after createdAt before the
   * value is considered stale.
   */
  ttl: number;
  createdAt: number;
  state: 'cached';
};

export type LoadingStorageValue = {
  data?: CachedResponse;
  ttl?: number;

  /**
   * Defined when the state is cached
   */
  createdAt?: undefined;
  state: 'loading';
};

export type EmptyStorageValue = {
  data?: undefined;
  ttl?: undefined;

  /**
   * Defined when the state is cached
   */
  createdAt?: undefined;
  state: 'empty';
};

export type StaleStorageValue = {
  data: CachedResponse;
  ttl: number;
  createdAt: number;
  state: 'stale';
};
