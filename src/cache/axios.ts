import type {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
  InternalAxiosRequestConfig
} from 'axios';
import type { CacheInstance, CacheProperties } from './cache.js';

/**
 * A slightly changed than the original axios response. Containing information about the
 * cache and other needed properties.
 *
 * @template R The type returned by this response
 * @template D The type that the request body was
 * @see https://axios-cache-interceptor.js.org/config/response-object
 */
export interface CacheAxiosResponse<R = any, D = any> extends AxiosResponse<R, D> {
  config: InternalCacheRequestConfig<R, D>;

  /**
   * The [Request ID](https://axios-cache-interceptor.js.org/guide/request-id) used in
   * this request.
   *
   * It may have been generated by the [Key
   * Generator](https://axios-cache-interceptor.js.org/guide/request-id#custom-generator)
   * or a custom one provided by
   * [`config.id`](https://axios-cache-interceptor.js.org/config/request-specifics#id)
   *
   * @see https://axios-cache-interceptor.js.org/config/response-object#id
   */
  id: string;

  /**
   * A simple boolean indicating if the request returned data from the cache or from the
   * network call.
   *
   * This does not indicated if the request was capable of being cached or not, as options
   * like
   * [`cache.override`](https://axios-cache-interceptor.js.org/config/request-specifics#cache-override)
   * may have been enabled.
   *
   * @see https://axios-cache-interceptor.js.org/config/response-object#cached
   */
  cached: boolean;

  /**
   * A simple boolean indicating if the request returned data is from valid or stale cache.
   *
   * @see https://axios-cache-interceptor.js.org/config/response-object#stale
   */
  stale?: boolean;
}

/**
 * Options that can be overridden per request
 *
 * @template R The type returned by this response
 * @template D The type for the request body
 */
export interface CacheRequestConfig<R = any, D = any> extends AxiosRequestConfig<D> {
  /**
   * The [Request ID](https://axios-cache-interceptor.js.org/guide/request-id) used in
   * this request.
   *
   * It may have been generated by the [Key
   * Generator](https://axios-cache-interceptor.js.org/guide/request-id#custom-generator)
   * or a custom one provided by
   * [`config.id`](https://axios-cache-interceptor.js.org/config/request-specifics#id)
   *
   * @default 'auto generated by the current key generator'
   * @see https://axios-cache-interceptor.js.org/config/response-object#id
   */
  id?: string;

  /**
   * The cache option available through the request config is where all the cache
   * customization happens.
   *
   * Setting the `cache` property to `false` will disable the cache for this request.
   *
   * This does not mean that the current cache will be excluded from the storage.
   *
   * @default 'inherits from global configuration'
   * @see https://axios-cache-interceptor.js.org/config/response-object#cache
   */
  cache?: false | Partial<CacheProperties<R, D>>;
}

/** Cached version of type {@link InternalAxiosRequestConfig} */
export interface InternalCacheRequestConfig<R = any, D = any> extends CacheRequestConfig<R, D> {
  headers: AxiosResponseHeaders;
}

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config type and
 * CacheAxiosResponse as response type.
 *
 * @see https://axios-cache-interceptor.js.org/guide/getting-started
 */
export interface AxiosCacheInstance extends CacheInstance, AxiosInstance {
  /**
   * @template T1 The type returned by this response
   * @template R1 The custom response type that the request can return
   * @template D1 The type that the request body use
   */
  <T1 = any, D1 = any, R1 = CacheAxiosResponse<T1, D1>>(
    config: CacheRequestConfig<T1, D1>
  ): Promise<R1>;
  /**
   * @template T2 The type returned by this response
   * @template R2 The custom response type that the request can return
   * @template D2 The type that the request body use
   */
  <T2 = any, D2 = any, R2 = CacheAxiosResponse<T2, D2>>(
    url: string,
    config?: CacheRequestConfig<T2, D2>
  ): Promise<R2>;

  defaults: AxiosInstance['defaults'] & {
    cache: CacheProperties;
  };

  interceptors: {
    request: AxiosInterceptorManager<InternalCacheRequestConfig<unknown, unknown>>;
    response: AxiosInterceptorManager<
      Partial<CacheAxiosResponse<unknown, unknown>> & AxiosResponse<unknown, unknown>
    >;
  };

  /** @template D The type that the request body use */
  getUri<D>(config?: CacheRequestConfig<any, D>): string;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  request<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  get<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  delete<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  head<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  options<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  post<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  postForm<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  put<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  putForm<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  patch<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  patchForm<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;
}
