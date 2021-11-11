import type { EmptyStorageValue, StorageValue } from './types';

export abstract class AxiosStorage {
  /**
   * Returns the cached value for the given key. Must handle cache
   * miss and staling by returning a new `StorageValue` with `empty` state.
   *
   * @see {AxiosStorage#isValid}
   */
  public abstract get: (key: string) => Promise<StorageValue> | StorageValue;

  /**
   * Sets a new value for the given key
   *
   * Use CacheStorage.remove(key) to define a key to 'empty' state.
   */
  public abstract set: (
    key: string,
    value: Exclude<StorageValue, EmptyStorageValue>
  ) => Promise<void> | void;

  /**
   * Removes the value for the given key
   */
  public abstract remove: (key: string) => Promise<void> | void;

  /**
   * Returns true if a storage value can still be used by checking his
   * createdAt and ttl values.
   */
  static isValid = (value?: StorageValue): boolean | 'unknown' => {
    if (value?.state === 'cached') {
      return value.createdAt + value.ttl > Date.now();
    }

    return true;
  };
}
