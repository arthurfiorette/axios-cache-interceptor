import type { Method } from 'axios';
import type { Deferred } from 'fast-defer';
import type { HeadersInterpreter } from '../header/types';
import type { AxiosInterceptor } from '../interceptors/types';
import type { AxiosStorage, CachedResponse } from '../storage/types';
import type { CachePredicate, KeyGenerator } from '../util/types';
import type { CacheUpdater } from '../util/update-cache';
import type { CacheAxiosResponse, CacheRequestConfig } from './axios';

export type CacheProperties = {
  /**
   * The time until the cached value is expired in milliseconds.
   *
   * When using `interpretHeader: true`, this value will only be used if the interpreter
   * can't determine their TTL value to override this
   *
   * **Note**: a custom storage implementation may not respect this.
   *
   * @default 1000 * 60 * 5 // 5 Minutes
   */
  ttl: number;

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
   * @default {statusCheck: [200, 399]}
   */
  cachePredicate: CachePredicate;

  /**
   * Once the request is resolved, this specifies what requests should we change the
   * cache. Can be used to update the request or delete other caches.
   *
   * If the function returns nothing, the entry is deleted
   *
   * This is independent if the request made was cached or not.
   *
   * The id used is the same as the id on `CacheRequestConfig['id']`, auto-generated or not.
   *
   * @default {{}}
   */
  update: Record<string, CacheUpdater>;

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
   * baseUrl, params, and url
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
   */
  headerInterpreter: HeadersInterpreter;

  /** The request interceptor that will be used to handle the cache. */
  requestInterceptor: AxiosInterceptor<CacheRequestConfig<any>>;

  /** The response interceptor that will be used to handle the cache. */
  responseInterceptor: AxiosInterceptor<CacheAxiosResponse<any, any>>;
}
