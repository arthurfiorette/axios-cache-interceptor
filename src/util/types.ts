import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios';
import type {
  CachedStorageValue,
  LoadingStorageValue,
  StorageValue
} from '../storage/types';

export type CachePredicate<R = any, D = any> =
  | CachePredicateObject<R, D>
  | (<R, D>(response: CacheAxiosResponse<R, D>) => boolean);

export type CachePredicateObject<R = any, D = any> = {
  /**
   * The status predicate, if a tuple is returned, the first and seconds value means the
   * interval (inclusive) accepted. Can also be a function.
   */
  statusCheck?: [start: number, end: number] | ((status: number) => boolean);

  /**
   * Matches if the response header container all keys. A tuple also checks for values.
   * Can also be a predicate.
   */
  containsHeaders?: Record<string, true | string | ((header: string) => boolean)>;

  /** Check if the desired response matches this predicate. */
  responseMatch?: (res: CacheAxiosResponse<R, D>) => boolean;
};

/** A simple function that receives a cache request config and should return a string id for it. */
export type KeyGenerator = <R = any, D = any>(
  options: CacheRequestConfig<R, D>
) => string;

type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export type CacheUpdater<R, D> =
  | 'delete'
  | ((
      cached: Exclude<StorageValue, LoadingStorageValue>,
      response: CacheAxiosResponse<R, D>
    ) => MaybePromise<CachedStorageValue | 'delete' | 'ignore'>);
