import type {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import type { Deferred } from 'typed-core/dist/promises/deferred';
import type { HeaderInterpreter } from '../header/types';
import type { AxiosInterceptor } from '../interceptors/types';
import type {
  CachedResponse,
  CachedStorageValue,
  CacheStorage,
  EmptyStorageValue
} from '../storage/types';
import type { CachePredicate, KeyGenerator } from '../util/types';

export type CacheUpdater =
  | 'delete'
  | ((
      cached: EmptyStorageValue | CachedStorageValue,
      newData: any
    ) => CachedStorageValue | void);

export type DefaultCacheRequestConfig = AxiosRequestConfig & {
  cache: CacheProperties;
};

export type CacheProperties = {
  /**
   * The time until the cached value is expired in milliseconds.
   *
   * When using `interpretHeader: true`, this value will only be used
   * if the interpreter can't determine their TTL value to override this
   *
   * **Note**: a custom storage implementation may not respect this.
   *
   * @default 1000 * 60 * 5 // 5 Minutes
   */
  ttl: number;

  /**
   * If this interceptor should configure the cache from the request
   * cache header When used, the ttl property is ignored
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
   * @default {statusCheck: [200, 399]}
   */
  cachePredicate: CachePredicate;

  /**
   * Once the request is resolved, this specifies what requests should
   * we change the cache. Can be used to update the request or delete
   * other caches.
   *
   * If the function returns nothing, the entry is deleted
   *
   * This is independent if the request made was cached or not.
   *
   * The id used is the same as the id on `CacheRequestConfig['id']`,
   * auto-generated or not.
   *
   * @default
   */
  update: Record<string, CacheUpdater>;
};

/**
 * @template T The data type that this responses use. Also the same
 *   generic type as it's request
 */
export type CacheAxiosResponse<T> = AxiosResponse<T> & {
  config: CacheRequestConfig<T>;

  /**
   * The id used for this request. if config specified an id, the id
   * will be returned
   */
  id: string;

  /**
   * A simple boolean to check whether this request was cached or not
   */
  cached: boolean;
};

/**
 * Options that can be overridden per request
 *
 * @template T The data that this request should return
 */
export type CacheRequestConfig<T> = AxiosRequestConfig<T> & {
  /**
   * An id for this request, if this request is used in cache, only
   * the last request made with this id will be returned.
   *
   * @default undefined
   */
  id?: string;

  /**
   * All cache options for the request.
   *
   * False means ignore everything about cache, for this request.
   */
  cache?: false | Partial<CacheProperties>;
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
   * Defaults to a function that priorizes the id, and if not
   * specified, a string is generated using the method, baseUrl,
   * params, and url
   */
  generateKey: KeyGenerator;

  /**
   * A simple object that holds all deferred objects until it is
   * resolved or rejected.
   *
   * Can be used to listen when a request is cached or not.
   */
  waiting: Record<string, Deferred<CachedResponse, void>>;

  /**
   * The function to parse and interpret response headers. Only used
   * if cache.interpretHeader is true.
   */
  headerInterpreter: HeaderInterpreter;

  /**
   * The request interceptor that will be used to handle the cache.
   */
  requestInterceptor: AxiosInterceptor<CacheRequestConfig<any>>;

  /**
   * The response interceptor that will be used to handle the cache.
   */
  responseInterceptor: AxiosInterceptor<CacheAxiosResponse<any>>;
}

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config
 * type and CacheAxiosResponse as response type.
 *
 * @see AxiosInstance
 * @see CacheRequestConfig
 * @see CacheInstance
 */
export interface AxiosCacheInstance extends AxiosInstance, CacheInstance {
  <T>(config: CacheRequestConfig<T>): AxiosPromise;
  <T>(url: string, config?: CacheRequestConfig<T>): AxiosPromise;

  defaults: DefaultCacheRequestConfig;

  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig<any>>;
    response: AxiosInterceptorManager<CacheAxiosResponse<never>>;
  };

  getUri<T>(config?: CacheRequestConfig<T>): string;

  request<T = any, R = CacheAxiosResponse<T>>(config: CacheRequestConfig<T>): Promise<R>;

  get<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  delete<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  head<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  options<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  post<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  put<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
  patch<T = any, R = CacheAxiosResponse<T>>(
    url: string,
    data?: any,
    config?: CacheRequestConfig<T>
  ): Promise<R>;
}
