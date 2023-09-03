import type { CacheAxiosResponse, InternalCacheRequestConfig } from '../cache/axios';

/** See {@link AxiosInterceptorManager} */
export interface AxiosInterceptor<T> {
  onFulfilled(value: T): T | Promise<T>;

  /** Returns a successful response or re-throws the error */
  onRejected?(error: Record<string, unknown>): T | Promise<T>;

  apply: () => void;
}

export type RequestInterceptor = AxiosInterceptor<
  InternalCacheRequestConfig<unknown, unknown>
>;
export type ResponseInterceptor = AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>;
