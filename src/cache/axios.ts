import type {
  AxiosDefaults,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import type { CacheInstance, CacheProperties } from './cache';

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

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config
 * type and CacheAxiosResponse as response type.
 *
 * @see Axios
 * @see CacheRequestConfig
 * @see CacheInstance
 */
export interface AxiosCacheInstance extends CacheInstance {
  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  <R = any, D = any>(config: CacheRequestConfig<D>): Promise<
    CacheAxiosResponse<R, D>
  >;
  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  <R = any, D = any>(url: string, config?: CacheRequestConfig<D>): Promise<
    CacheAxiosResponse<R, D>
  >;

  defaults: AxiosDefaults<any> & {
    cache: CacheProperties;
  };

  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig<any>>;
    response: AxiosInterceptorManager<CacheAxiosResponse<never, any>>;
  };

  /**
   * @template D The type that the request body use
   */
  getUri<D>(config?: CacheRequestConfig<D>): string;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  request<R = any, D = any>(
    config: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  get<R = any, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  delete<R = any, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  head<R = any, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  options<R = any, D = any>(
    url: string,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  post<R = any, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  put<R = any, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;

  /**
   * @template R The type returned by this response
   * @template D The type that the request body use
   */
  patch<R = any, D = any>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<D>
  ): Promise<CacheAxiosResponse<R, D>>;
}
