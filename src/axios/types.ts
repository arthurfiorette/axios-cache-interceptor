import type {
  AxiosDefaults,
  AxiosInterceptorManager,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import type { Deferred } from 'typed-core/dist/promises/deferred';
import type { HeaderInterpreter } from '../header/types';
import type { AxiosInterceptor } from '../interceptors/types';
import type { CachedResponse, CacheStorage } from '../storage/types';
import type { CachePredicate, KeyGenerator } from '../util/types';
import type { CacheUpdater } from '../util/update-cache';

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
 * @template R The type returned by this response
 * @template D The type that the request body was
 */
export type CacheAxiosResponse<R, D> = AxiosResponse<R, D> & {
  config: CacheRequestConfig<D>;

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
 * @template D The type for the request body
 */
export type CacheRequestConfig<D> = AxiosRequestConfig<D> & {
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
  responseInterceptor: AxiosInterceptor<CacheAxiosResponse<unknown, any>>;
}

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config
 * type and CacheAxiosResponse as response type.
 *
 * @see Axios
 * @see CacheRequestConfig
 * @see CacheInstance
 */
export interface AxiosCacheInstance extends CacheInstance {
  <T>(config: CacheRequestConfig<T>): AxiosPromise;
  <T>(url: string, config?: CacheRequestConfig<T>): AxiosPromise;

  defaults: AxiosDefaults<any> & {
    cache: CacheProperties;
  };

  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig<any>>;
    response: AxiosInterceptorManager<CacheAxiosResponse<never, any>>;
  };

  getUri<T>(config?: CacheRequestConfig<T>): string;

  request<R = unknown, D = any>(
    config: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  get<R = unknown, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  delete<R = unknown, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  head<R = unknown, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  options<R = unknown, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  post<R = unknown, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  put<R = unknown, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  patch<R = unknown, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;
}
