import type { AxiosResponse } from 'axios';
import type { InternalCacheRequestConfig } from '../cache/axios.js';

/** See {@link AxiosInterceptorManager} */
export interface AxiosInterceptor<T> {
  onFulfilled(value: T): T | Promise<T>;

  /** Returns a successful response or re-throws the error */
  onRejected?(error: Record<string, unknown>): T | Promise<T>;

  apply: () => void;
}

export type RequestInterceptor = AxiosInterceptor<InternalCacheRequestConfig<unknown, unknown>>;
export type ResponseInterceptor = AxiosInterceptor<AxiosResponse<unknown, unknown>>;
