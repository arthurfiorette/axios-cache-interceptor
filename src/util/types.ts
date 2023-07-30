import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios';
import type {
  CachedStorageValue,
  LoadingStorageValue,
  StorageValue
} from '../storage/types';

export type CachePredicate<R = unknown, D = unknown> = Exclude<
  CachePredicateObject<R, D> | CachePredicateObject<R, D>['responseMatch'],
  undefined
>;

export interface CachePredicateObject<R = unknown, D = unknown> {
  /** Matches if this function returned true. */
  statusCheck?: (status: number) => MaybePromise<boolean>;

  /**
   * Matches if all keys in this object returned true.
   *
   * The response does not contain all headers specified here, the specified function will
   * be called without argument.
   *
   * ### Remember, all axios headers are lowercase.
   */
  containsHeaders?: Record<
    string,
    (header?: CacheAxiosResponse['headers'][string]) => MaybePromise<boolean>
  >;

  /** Check if the response matches this predicate. */
  responseMatch?: (res: CacheAxiosResponse<R, D>) => MaybePromise<boolean>;
}

/**
 * A simple function that receives a cache request config and should return a string id
 * for it.
 */
export type KeyGenerator<R = unknown, D = unknown> = (
  options: CacheRequestConfig<R, D>
) => string;

export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

/**
 * You can use a `number` to ensure an max time (in seconds) that the cache can be reused.
 *
 * You can use `true` to use the cache until a new response is received.
 *
 * You can use a `function` predicate to determine if the cache can be reused (`boolean`)
 * or how much time the cache can be used (`number`)
 */
export type StaleIfErrorPredicate<R, D> =
  | number
  | boolean
  | ((
      networkResponse: CacheAxiosResponse<R, D> | undefined,
      cache: LoadingStorageValue & { previous: 'stale' },
      error: Record<string, unknown>
    ) => MaybePromise<number | boolean>);

export type CacheUpdaterFn<R, D> = (
  response: CacheAxiosResponse<R, D>
) => MaybePromise<void>;

/**
 * A record for a custom cache updater for each specified request id.
 *
 * `delete` -> Deletes the request cache `predicate()` -> Determines if the cache can be
 * reused, deleted or modified.
 */
export interface CacheUpdaterRecord<R, D> {
  [requestId: string]:
    | 'delete'
    | ((
        cached: Exclude<StorageValue, LoadingStorageValue>,
        response: CacheAxiosResponse<R, D>
      ) => MaybePromise<CachedStorageValue | 'delete' | 'ignore'>);
}

/**
 * Updates any specified request cache by applying the response for this network call.
 *
 * You can use a function to implement your own cache updater function.
 */
export type CacheUpdater<R, D> = CacheUpdaterFn<R, D> | CacheUpdaterRecord<R, D>;
