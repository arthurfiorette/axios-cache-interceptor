import type { AxiosInstance } from 'axios';
import { defaultHeaderInterpreter } from '../header/interpreter';
import { defaultRequestInterceptor } from '../interceptors/request';
import { defaultResponseInterceptor } from '../interceptors/response';
import { isStorage } from '../storage/build';
import { buildMemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import type { AxiosCacheInstance } from './axios';
import type { CacheInstance, CacheProperties } from './cache';

export type CacheOptions = Partial<CacheInstance> & Partial<CacheProperties>;

/**
 * Apply the caching interceptors for a already created axios instance.
 *
 * @example
 *
 * ```ts
 * import Axios from 'axios';
 * import { setupCache, AxiosCacheInstance } from 'axios-cache-interceptor';
 *
 * // instance will have our custom typings from the return of this function
 * const instance = setupCache(
 *   Axios.create({
 *     // Axios options
 *   }),
 *   {
 *     // Axios-cache-interceptor options
 *   }
 * );
 *
 * // OR
 *
 * const instance = axios.create({
 *   // Axios options
 * }) as AxiosCacheInstance;
 *
 * // As this functions returns the same axios instance but only with
 * // different typings, you can ignore the function return.
 * setupCache(instance, {
 *   // Axios-cache-interceptor options
 * });
 * ```
 *
 * @param axios The already created axios instance
 * @param config The config for the caching interceptors
 * @returns The same instance with extended typescript types.
 */
export function setupCache(
  axios: AxiosInstance,
  options: CacheOptions = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = options.storage || buildMemoryStorage();

  if (!isStorage(axiosCache.storage)) {
    throw new Error('Use buildStorage() function');
  }

  axiosCache.generateKey = options.generateKey || defaultKeyGenerator;
  axiosCache.waiting = options.waiting || {};
  axiosCache.headerInterpreter = options.headerInterpreter || defaultHeaderInterpreter;
  axiosCache.requestInterceptor =
    options.requestInterceptor || defaultRequestInterceptor(axiosCache);
  axiosCache.responseInterceptor =
    options.responseInterceptor || defaultResponseInterceptor(axiosCache);
  axiosCache.debug = options.debug;

  // CacheRequestConfig values
  axiosCache.defaults.cache = {
    ttl: options.ttl ?? 1000 * 60 * 5,
    interpretHeader: options.interpretHeader ?? false,
    methods: options.methods || ['get'],
    cachePredicate: options.cachePredicate || {
      statusCheck: (status) => status >= 200 && status < 400
    },
    etag: options.etag ?? false,
    modifiedSince: options.modifiedSince ?? false,
    staleIfError: options.staleIfError ?? false,
    update: options.update || {}
  };

  // Apply interceptors
  axiosCache.requestInterceptor.apply();
  axiosCache.responseInterceptor.apply();

  return axiosCache;
}
