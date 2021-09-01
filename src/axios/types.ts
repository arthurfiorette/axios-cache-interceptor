import type {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import { CacheStorage } from '../storage/types';

/**
 * Options that can be overridden per request
 */
export type CacheRequestConfig = AxiosRequestConfig & {
  /**
   * All cache options for the request
   */
  cache?: {
    /**
     * The time until the cached value is expired in milliseconds.
     *
     * @default 1000 * 60 * 5
     */
    maxAge?: number;

    /**
     * If this interceptor should configure the cache from the request cache header
     * When used, the maxAge property is ignored
     *
     * @default false
     */
    interpretHeader?: boolean;

    /**
     * All methods that should be cached.
     *
     * @default ['get']
     */
    methods?: Lowercase<Method>[];
  };
};

export interface CacheInstance {
  /**
   * The storage to save the cache data.
   *
   * @default new MemoryStorage()
   */
  storage: CacheStorage;
}

export interface AxiosCacheInstance extends AxiosInstance, CacheInstance {
  (config: CacheRequestConfig): AxiosPromise;
  (url: string, config?: CacheRequestConfig): AxiosPromise;

  defaults: CacheRequestConfig;
  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig>;
    response: AxiosInterceptorManager<
      AxiosResponse & { config: CacheRequestConfig }
    >;
  };

  getUri(config?: CacheRequestConfig): string;

  request<T = any, R = AxiosResponse<T>>(
    config: CacheRequestConfig
  ): Promise<R>;

  get<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig
  ): Promise<R>;
  delete<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig
  ): Promise<R>;
  head<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig
  ): Promise<R>;
  options<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig
  ): Promise<R>;
  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig
  ): Promise<R>;
  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig
  ): Promise<R>;
  patch<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig
  ): Promise<R>;
}
