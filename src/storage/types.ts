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
