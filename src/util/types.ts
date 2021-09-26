import type { AxiosResponse } from 'axios';
import type { CacheRequestConfig } from '../axios/types';

export type CachePredicate =
  | CachePredicateObject
  | ((response: AxiosResponse) => boolean);

export type CachePredicateObject = {
  /**
   * The status predicate, if a tuple is returned, the first and
   * seconds value means the interval (inclusive) accepted. Can also
   * be a function.
   */
  statusCheck?: [start: number, end: number] | ((status: number) => boolean);

  /**
   * Matches if the response header container all keys. A tuple also
   * checks for values. Can also be a predicate.
   */
  containsHeaders?: Record<string, true | string | ((header: string) => boolean)>;

  /**
   * Check if the desired response matches this predicate.
   */
  responseMatch?: <T = any>(res: T | undefined) => boolean;
};

/**
 * A simple function that receives a cache request config and should
 * return a string id for it.
 */
export type KeyGenerator = (options: CacheRequestConfig) => string;
