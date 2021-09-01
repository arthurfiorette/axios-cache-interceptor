import { Deferred } from '#/utils/deferred';

export interface CacheStorage {
  /**
   * Returns the cached value for the given key. Should return a 'empty'
   * state StorageValue if the key does not exist.
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

export type CachedResponse = {
  headers: any;
  body: any;
};

/**
 * The value returned for a given key.
 */
export type StorageValue =
  | {
      data: CachedResponse;
      expiration: number;
      state: 'cached';
    }
  | {
      data: Deferred<CachedResponse>;
      /**
       * If interpretHeader is used, this value will be `-1`until the response is received
       */
      expiration: number;
      state: 'loading';
    }
  | {
      data: null;
      expiration: -1;
      state: 'empty';
    };
