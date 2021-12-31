import type { AxiosInstance } from 'axios';
import { defaultHeaderInterpreter } from '../header/interpreter';
import { CacheRequestInterceptor } from '../interceptors/request';
import { CacheResponseInterceptor } from '../interceptors/response';
import { MemoryAxiosStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import type { AxiosCacheInstance } from './axios';
import type { CacheInstance, CacheProperties } from './cache';

export type CacheOptions = Partial<CacheInstance> & Partial<CacheProperties>;

const symbolKey = Symbol();

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
 * @returns The same instance with better typescript types.
 */
export function setupCache(
  axios: AxiosInstance,
  {
    storage,
    generateKey,
    waiting,
    headerInterpreter,
    requestInterceptor,
    responseInterceptor,
    ...cacheOptions
  }: CacheOptions = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = storage || new MemoryAxiosStorage();
  axiosCache.generateKey = generateKey || defaultKeyGenerator;
  axiosCache.waiting = waiting || {};
  axiosCache.headerInterpreter = headerInterpreter || defaultHeaderInterpreter;
  axiosCache.requestInterceptor =
    requestInterceptor || new CacheRequestInterceptor(axiosCache);
  axiosCache.responseInterceptor =
    responseInterceptor || new CacheResponseInterceptor(axiosCache);

  // CacheRequestConfig values
  axiosCache.defaults = {
    ...axios.defaults,
    cache: {
      ttl: 1000 * 60 * 5,
      interpretHeader: false,
      methods: ['get'],
      cachePredicate: { statusCheck: [200, 399] },
      etag: false,
      modifiedSince: false,
      update: {},
      ...cacheOptions
    }
  };

  // Apply interceptors
  axiosCache.requestInterceptor.use();
  axiosCache.responseInterceptor.use();

  // @ts-expect-error - internal only
  axiosCache[symbolKey] = 1;

  return axiosCache;
}

/** @deprecated */
export const useCache = setupCache as unknown as 'use setupCache instead';
/** @deprecated */
export const createCache = setupCache as unknown as 'use setupCache instead';

/**
 * Detects if the given parameter has caching enabled. The only way to this return true is
 * by using the {@link setupCache} function.
 *
 * @param axios The axios instance to use
 * @returns True if the axios instance is using the caching interceptor
 */
export const isAxiosCacheInterceptor = (axios: any): axios is AxiosCacheInstance =>
  !!axios && !!axios[symbolKey];
