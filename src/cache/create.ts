import type { AxiosInstance } from 'axios';
import { defaultHeaderInterpreter } from '../header/interpreter';
import { CacheRequestInterceptor } from '../interceptors/request';
import { CacheResponseInterceptor } from '../interceptors/response';
import { MemoryAxiosStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import type { AxiosCacheInstance } from './axios';
import type { CacheInstance, CacheProperties } from './cache';

export type CacheOptions = Partial<CacheInstance> & Partial<CacheProperties>;

/**
 * Apply the caching interceptors for a already created axios instance.
 *
 * @param axios The already created axios instance
 * @param config The config for the caching interceptors
 * @returns The same instance but with caching enabled
 */
export function useCache(
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

  axiosCache.storage = storage || new MemoryAxiosStorage({});
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

  return axiosCache;
}
