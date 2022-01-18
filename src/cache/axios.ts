/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AxiosDefaults,
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import type { CacheInstance, CacheProperties } from './cache';

/**
 * @template R The type returned by this response
 * @template D The type that the request body was
 */
export type CacheAxiosResponse<R = any, D = any> = AxiosResponse<R, D> & {
  config: CacheRequestConfig<R, D>;

  /** The id used for this request. if config specified an id, the id will be returned */
  id: string;

  /** A simple boolean to check whether this request was cached or not */
  cached: boolean;
};

/**
 * Options that can be overridden per request
 *
 * @template R The type returned by this response
 * @template D The type for the request body
 */
export type CacheRequestConfig<R = any, D = any> = AxiosRequestConfig<D> & {
  /**
   * An id for this request, if this request is used in cache, only the last request made
   * with this id will be returned.
   *
   * @default undefined
   */
  id?: string;

  /**
   * All cache options for the request.
   *
   * False means ignore everything about cache, for this request.
   */
  cache?: false | Partial<CacheProperties<R, D>>;
};

/**
 * Same as the AxiosInstance but with CacheRequestConfig as a config type and
 * CacheAxiosResponse as response type.
 *
 * @see AxiosInstance
 * @see CacheRequestConfig
 * @see CacheInstance
 */
export interface AxiosCacheInstance extends CacheInstance, AxiosInstance {
  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  <T = any, D = any, R = CacheAxiosResponse<T, D>>(
    config: CacheRequestConfig<T, D>
  ): Promise<R>;
  /**
   * @template T The type returned by this response
   * @template R The custom response type that the request can return
   * @template D The type that the request body use
   */
  <T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;

  defaults: AxiosDefaults<any> & {
    cache: CacheProperties;
  };

  interceptors: {
    request: AxiosInterceptorManager<CacheRequestConfig>;
    response: AxiosInterceptorManager<CacheAxiosResponse>;
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
  patch<T = any, D = any, R = CacheAxiosResponse<T, D>>(
    url: string,
    data?: D,
    config?: CacheRequestConfig<T, D>
  ): Promise<R>;
}
