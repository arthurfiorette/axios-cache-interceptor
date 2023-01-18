import type { CacheAxiosResponse, FullCacheRequestConfig } from '../cache/axios';

/** See {@link AxiosInterceptorManager} */
export interface AxiosInterceptor<T> {
  onFulfilled?(this: void, value: T): T | Promise<T>;
  /** Returns a successful response or re-throws the error */
  onRejected?(this: void, error: Record<string, unknown>): T | Promise<T>;
}

export type CacheRequestInterceptor = AxiosInterceptor<FullCacheRequestConfig>;
export type CacheResponseInterceptor = AxiosInterceptor<CacheAxiosResponse>;
