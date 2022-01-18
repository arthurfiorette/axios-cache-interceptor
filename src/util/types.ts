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

export type CachePredicateObject<R = unknown, D = unknown> = {
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
  containsHeaders?: Record<string, (header?: string) => MaybePromise<boolean>>;

  /** Check if the response matches this predicate. */
  responseMatch?: (res: CacheAxiosResponse<R, D>) => MaybePromise<boolean>;
};

/** A simple function that receives a cache request config and should return a string id for it. */
export type KeyGenerator<R = unknown, D = unknown> = (
  options: CacheRequestConfig<R, D>
) => string;

export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export type CacheUpdater<R, D> =
  | 'delete'
  | ((
      cached: Exclude<StorageValue, LoadingStorageValue>,
      response: CacheAxiosResponse<R, D>
    ) => MaybePromise<CachedStorageValue | 'delete' | 'ignore'>);

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
