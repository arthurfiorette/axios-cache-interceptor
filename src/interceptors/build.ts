import type { AxiosInterceptorManager } from 'axios';
import type { CacheAxiosResponse, InternalCacheRequestConfig } from '../cache/axios.js';

/**
 * See {@link AxiosInterceptorManager}
 *
 * @deprecated This interface will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export interface AxiosInterceptor<T> {
  onFulfilled(value: T): T | Promise<T>;

  /** Returns a successful response or re-throws the error */
  onRejected?(error: Record<string, unknown>): T | Promise<T>;
}

/**
 * @deprecated This interface will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export type RequestInterceptor = AxiosInterceptor<InternalCacheRequestConfig<unknown, unknown>>;

/**
 * @deprecated This interface will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export type ResponseInterceptor = AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>;
