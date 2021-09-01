export interface CacheStorage {
  /**
   * Returns the cached value for the given key or a new empty
   */
  get: (key: string) => Promise<StorageValue>;
  /**
   * Sets a new value for the given key
   */
  set: (key: string, value: StorageValue) => Promise<void>;
  /**
   * Removes the value for the given key
   */
  remove: (key: string) => Promise<void>;
}

export interface StorageValue {
  /**
   * The value of the cached response
   */
  data: any | null;

  /**
   * The time when the cached response expires
   * -1 means not cached
   */
  expires: number;

  /**
   * The status of this value.
   */
  state: 'cached' | 'empty' | 'loading';
}
