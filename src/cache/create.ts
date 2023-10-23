import type { AxiosInstance } from 'axios';
import { defaultHeaderInterpreter } from '../header/interpreter';
import { defaultRequestInterceptor } from '../interceptors/request';
import { defaultResponseInterceptor } from '../interceptors/response';
import { isStorage } from '../storage/build';
import { buildMemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import type { AxiosCacheInstance } from './axios';
import type { CacheInstance, CacheProperties } from './cache';

export interface CacheOptions extends Partial<CacheInstance>, Partial<CacheProperties> {}

/**
 * Apply the caching interceptors for a already created axios instance.
 *
 * ```ts
 * const axios = setupCache(axios, OPTIONS);
 * ```
 *
 * The `setupCache` function receives global options and all [request
 * specifics](https://axios-cache-interceptor.js.org/config/request-specifics) ones too.
 * This way, you can customize the defaults for all requests.
 *
 * @param axios The already created axios instance
 * @param config The config for the caching interceptors
 * @returns The same instance with extended typescript types.
 * @see https://axios-cache-interceptor.js.org/config
 */
export function setupCache(
  axios: AxiosInstance,
  options: CacheOptions = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  if (axiosCache.defaults.cache) {
    throw new Error('setupCache() should be called only once');
  }

  axiosCache.storage = options.storage || buildMemoryStorage();

  if (!isStorage(axiosCache.storage)) {
    throw new Error('Use buildStorage() function');
  }

  axiosCache.waiting = options.waiting || {};

  axiosCache.generateKey = options.generateKey || defaultKeyGenerator;

  axiosCache.headerInterpreter = options.headerInterpreter || defaultHeaderInterpreter;

  axiosCache.requestInterceptor =
    options.requestInterceptor || defaultRequestInterceptor(axiosCache);

  axiosCache.responseInterceptor =
    options.responseInterceptor || defaultResponseInterceptor(axiosCache);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  axiosCache.debug = options.debug || function noop() {};

  // CacheRequestConfig values
  axiosCache.defaults.cache = {
    update: options.update || {},

    ttl: options.ttl ?? 1000 * 60 * 5,

    // Although RFC 7231 also marks POST as cacheable, most users don't know that
    // and may have problems about why their "create X" route not working.
    methods: options.methods || ['get', 'head'],

    cachePredicate: options.cachePredicate || {
      // All cacheable status codes defined in RFC 7231
      statusCheck: (status) =>
        [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status)
    },

    etag: options.etag ?? true,

    // This option is going to be ignored by servers when ETag is enabled
    // Checks strict equality to false to avoid undefined-ish values
    modifiedSince: options.modifiedSince ?? options.etag === false,

    interpretHeader: options.interpretHeader ?? true,

    cacheTakeover: options.cacheTakeover ?? true,

    staleIfError: options.staleIfError ?? true,

    override: options.override ?? false,

    hydrate: options.hydrate ?? undefined
  };

  // Apply interceptors
  axiosCache.requestInterceptor.apply();
  axiosCache.responseInterceptor.apply();

  return axiosCache;
}
