import type {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import { Deferred } from 'src/utils/deferred';
import { CachedResponse, CacheStorage } from '../storage/types';

export type DefaultCacheRequestConfig = AxiosRequestConfig & {
  cache: CacheProperties;
};

export type CacheProperties = {
  /**
   * The time until the cached value is expired in milliseconds.
   *
   * @default 1000 * 60 * 5
   */
  maxAge: number;

  /**
   * If this interceptor should configure the cache from the request cache header
   * When used, the maxAge property is ignored
   *
   * @default false
   */
  interpretHeader: boolean;

  /**
   * All methods that should be cached.
   *
   * @default ['get']
   */
  methods: Lowercase<Method>[];

  /**
   * The function to check if the response code permit being cached.
   *
   * @default ({ status }) => status >= 200 && status < 300
   */
  shouldCache: (response: AxiosResponse) => boolean;

  /**
   * Once the request is resolved, this specifies what requests should we change the cache.
   * Can be used to update the request or delete other caches.
   *
   * If the function returns void, the entry is deleted
   *
   * This is independent if the request made was cached or not.
   *
   * The id used is the same as the id on `CacheRequestConfig['id']`, auto-generated or not.
   *
   * @default {}
   */
  update: {
    [id: string]: 'delete' | ((oldValue: any, atual: any) => any | undefined);
  };
};

/**
 * Options that can be overridden per request
 */
export type CacheRequestConfig = AxiosRequestConfig & {
  /**
   * An id for this request, if this request is used in cache, only the last request made with this id will be returned.
   *
   * @see cacheKey
   * @default undefined
   */
  id?: string | number | symbol;

  /**
   * All cache options for the request
   */
  cache?: Partial<CacheProperties>;
};

export interface CacheInstance {
  /**
   * The storage to save the cache data.
   *
   * @default new MemoryStorage()
   */
  storage: CacheStorage;

  /**
   * The function used to create different keys for each request.
   * Defaults to a function that priorizes the id, and if not specified,
   * a string is generated using the method, baseUrl, params, and url
   */
  generateKey: (options: CacheRequestConfig) => string;

  /**
   * A simple object that holds all deferred objects until it is resolved.
   */
  waiting: Record<string, Deferred<CachedResponse>>;
}

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config type.
 *
 * @see AxiosInstance
 * @see CacheRequestConfig
 * @see CacheInstance
 */
export interface AxiosCacheInstance extends AxiosInstance, CacheInstance {
  (config: CacheRequestConfig): AxiosPromise;
  (url: string, config?: CacheRequestConfig): AxiosPromise;

  defaults: DefaultCacheRequestConfig;

  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse & { config: CacheRequestConfig }>;
  };

  getUri(config?: CacheRequestConfig): string;

  request<T = any, R = AxiosResponse<T>>(config: CacheRequestConfig): Promise<R>;

  get<T = any, R = AxiosResponse<T>>(url: string, config?: CacheRequestConfig): Promise<R>;
  delete<T = any, R = AxiosResponse<T>>(url: string, config?: CacheRequestConfig): Promise<R>;
  head<T = any, R = AxiosResponse<T>>(url: string, config?: CacheRequestConfig): Promise<R>;
  options<T = any, R = AxiosResponse<T>>(url: string, config?: CacheRequestConfig): Promise<R>;
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
