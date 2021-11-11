export type CachedResponse = {
  data?: any;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

/**
 * The value returned for a given key.
 */
export type StorageValue = CachedStorageValue | LoadingStorageValue | EmptyStorageValue;

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
  data?: undefined;
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
