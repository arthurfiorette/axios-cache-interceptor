import type { Method } from 'axios';
import type { Deferred } from 'fast-defer';
import type { HeadersInterpreter } from '../header/types';
import type { AxiosInterceptor } from '../interceptors/build';
import type { AxiosStorage, CachedResponse } from '../storage/types';
import type {
  CachePredicate,
  CacheUpdater,
  KeyGenerator,
  StaleIfErrorPredicate
} from '../util/types';
import type { CacheAxiosResponse, CacheRequestConfig } from './axios';

/**
 * @template R The type returned by this response
 * @template D The type for the request body
 */
export type CacheProperties<R = unknown, D = unknown> = {
  /**
   * The time until the cached value is expired in milliseconds.
   *
   * If a function is used, it will receive the complete response and waits to return a TTL value
   *
   * When using `interpretHeader: true`, this value will only be used if the interpreter
   * can't determine their TTL value to override this
   *
   * @default 1000 * 60 * 5 // 5 Minutes
   */
  ttl: number | ((response: CacheAxiosResponse<R, D>) => number | Promise<number>);

  /**
   * If this interceptor should configure the cache from the request cache header When
   * used, the ttl property is ignored
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
   * @default {statusCheck: (status) => status >= 200 && status < 400}
   */
  cachePredicate: CachePredicate<R, D>;

  /**
   * Once the request is resolved, this specifies what requests should we change the
   * cache. Can be used to update the request or delete other caches.
   *
   * This is independent if the request made was cached or not.
   *
   * If an provided id represents and loading cache, he will be ignored.
   *
   * The id used is the same as the id on `CacheRequestConfig['id']`, auto-generated or not.
   *
   * @default {{}}
   */
  update: Record<string, CacheUpdater<R, D>>;

  /**
   * If the request should handle ETag and If-None-Match support. Use a string to force a
   * custom value or true to use the response ETag
   *
   * @default false
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
   */
  etag: string | boolean;

  /**
   * Use If-Modified-Since header in this request. Use a date to force a custom value or
   * true to use the last cached timestamp. If never cached before, the header is not set.
   *
   * @default false
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
   */
  modifiedSince: Date | boolean;

  /**
   * Enables cache to be returned if the response comes with an error, either by invalid
   * status code, network errors and etc. You can filter the type of error that should be
   * stale by using a predicate function.
   *
   * **Note**: If the response is treated as error because of invalid status code *(like
   * from AxiosRequestConfig#invalidateStatus)*, and this ends up `true`, the cache will
   * be preserved over the "invalid" request. So, if you want to preserve the response,
   * you can use this predicate:
   *
   * ```js
   * const customPredicate = (response, cache, error) => {
   *   // Return false if has a response
   *   return !response;
   * };
   * ```
   *
   * Possible types:
   *
   * - `number` -> the max time (in seconds) that the cache can be reused.
   * - `boolean` -> `false` disables and `true` enables with infinite time.
   * - `function` -> a predicate that can return `number` or `boolean` as described above.
   *
   * @default false
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error
   */
  staleIfError: StaleIfErrorPredicate<R, D>;
};

export interface CacheInstance {
  /**
   * The storage to save the cache data. Defaults to an in-memory storage.
   *
   * @default buildMemoryStorage()
   */
  storage: AxiosStorage;

  /**
   * The function used to create different keys for each request. Defaults to a function
   * that priorizes the id, and if not specified, a string is generated using the method,
   * baseURL, params, and url
   */
  generateKey: KeyGenerator;

  /**
   * A simple object that holds all deferred objects until it is resolved or rejected.
   *
   * Can be used to listen when a request is cached or not.
   */
  waiting: Record<string, Deferred<CachedResponse>>;

  /**
   * The function to parse and interpret response headers. Only used if
   * cache.interpretHeader is true.
   *
   * @default defaultHeaderInterpreter()
   */
  headerInterpreter: HeadersInterpreter;

  /**
   * The request interceptor that will be used to handle the cache.
   *
   * @default defaultRequestInterceptor()
   */
  requestInterceptor: AxiosInterceptor<CacheRequestConfig>;

  /**
   * The response interceptor that will be used to handle the cache.
   *
   * @default defaultResponseInterceptor()
   */
  responseInterceptor: AxiosInterceptor<CacheAxiosResponse>;

  /**
   * Logs useful information in the console
   *
   * **Note**: This is only available with development mode enabled
   *
   * @default console.log
   * @see https://axios-cache-interceptor.js.org/#/pages/development-mode
   */
  debug: undefined | ((msg: DebugObject) => void);
}

/**
 * An object with any possible type that can be used to log and debug information in
 * `development` mode (a.k.a `__ACI_DEV__ === true`)
 */
export type DebugObject = Partial<{ id: string; msg: string; data: unknown }>;
