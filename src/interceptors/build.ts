import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios';

/** See {@link AxiosInterceptorManager} */
export interface AxiosInterceptor<T> {
  onFulfilled?(value: T): T | Promise<T>;
  onRejected?(error: unknown): unknown;
  apply: () => void;
}

export type RequestInterceptor = AxiosInterceptor<CacheRequestConfig<unknown, unknown>>;
export type ResponseInterceptor = AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>;
