import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios';
import type { MaybePromise } from '../util/types';

export interface CachedResponse {
  data?: unknown;
  headers: CacheAxiosResponse['headers'];
  status: number;
  statusText: string;
}

/** The value returned for a given key. */
export type StorageValue =
  | StaleStorageValue
  | CachedStorageValue
  | LoadingStorageValue
  | EmptyStorageValue;

export type NotEmptyStorageValue = Exclude<StorageValue, EmptyStorageValue>;

export interface StaleStorageValue {
  data: CachedResponse;
  ttl?: number;
  staleTtl?: undefined;
  createdAt: number;
  state: 'stale';
}

export interface CachedStorageValue {
  data: CachedResponse;
  /**
   * The number in milliseconds to wait after createdAt before the value is considered
   * stale.
   */
  ttl: number;
  staleTtl?: number;
  createdAt: number;
  state: 'cached';
}

export type LoadingStorageValue = LoadingEmptiedStorageValue | LoadingStaledStorageValue;

export interface LoadingEmptiedStorageValue {
  data?: undefined;
  ttl?: undefined;
  staleTtl?: undefined;
  createdAt?: undefined;
  state: 'loading';
  previous: 'empty';
}

export interface LoadingStaledStorageValue {
  state: 'loading';
  data: CachedResponse;
  ttl?: undefined;
  staleTtl?: undefined;
  createdAt: number;
  previous: 'stale';
}

export interface EmptyStorageValue {
  data?: undefined;
  ttl?: undefined;
  staleTtl?: undefined;

  /** Defined when the state is cached */
  createdAt?: undefined;
  state: 'empty';
}

/**
 * A storage interface is the entity responsible for saving, retrieving and serializing
 * data received from network and requested when a axios call is made.
 *
 * @default buildMemoryStorage
 * @see https://axios-cache-interceptor.js.org/guide/storages
 */
export interface AxiosStorage {
  /**
   * Sets a new value for the given key
   *
   * Use {@link AxiosStorage.remove} to define a key with `'empty'` state.
   *
   * @param key The key to look for
   * @param value The value to save.
   * @param currentRequest The current {@link CacheRequestConfig}, if any
   * @see https://axios-cache-interceptor.js.org/guide/storages#buildstorage
   */
  set: (
    key: string,
    value: NotEmptyStorageValue,
    currentRequest?: CacheRequestConfig
  ) => MaybePromise<void>;

  /**
   * Removes the value for the given key
   *
   * @param key The key to look for
   * @param currentRequest The current {@link CacheRequestConfig}, if any
   * @see https://axios-cache-interceptor.js.org/guide/storages#buildstorage
   */
  remove: (key: string, currentRequest?: CacheRequestConfig) => MaybePromise<void>;

  /**
   * Returns the value for the given key. This method make checks for cache invalidation
   * or etc.
   *
   * If the internal `find()` method returned null, this will map it to a `'empty'`
   * storage value.
   *
   * @param key The key to look for
   * @param currentRequest The current {@link CacheRequestConfig}, if any
   * @returns The saved value for the given key.
   * @see https://axios-cache-interceptor.js.org/guide/storages#buildstorage
   */
  get: (key: string, currentRequest?: CacheRequestConfig) => MaybePromise<StorageValue>;
}
