import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { defaultHeaderInterpreter } from '../header/interpreter';
import { CacheRequestInterceptor } from '../interceptors/request';
import { CacheResponseInterceptor } from '../interceptors/response';
import { MemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import CacheInstance, { AxiosCacheInstance, CacheProperties } from './types';

/**
 * Apply the caching interceptors for a already created axios instance.
 *
 * @param axios The already created axios instance
 * @param config The config for the caching interceptors
 * @returns The same instance but with caching enabled
 */
export function applyCache(
  axios: AxiosInstance,
  {
    storage,
    generateKey,
    waiting,
    headerInterpreter,
    requestInterceptor,
    responseInterceptor,
    ...cacheOptions
  }: Partial<CacheInstance> & Partial<CacheProperties> = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = storage || new MemoryStorage();
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
      cachePredicate: {
        statusCheck: [200, 399]
      },
      update: {},
      ...cacheOptions
    }
  };

  // Apply interceptors
  axiosCache.requestInterceptor.apply();
  axiosCache.responseInterceptor.apply();

  return axiosCache;
}

/**
 * Returns a new axios instance with caching enabled.
 *
 * @param config The config for the caching interceptors and the axios instance
 * @returns A new AxiosCacheInstance with caching enabled
 */
export function createCache({
  axios = {},
  cache = {}
}: CreateCacheOptions = {}): AxiosCacheInstance {
  return applyCache(Axios.create(axios), cache);
}

export type CreateCacheOptions = {
  axios?: Partial<AxiosRequestConfig>;
  cache?: Partial<CacheInstance> & Partial<CacheProperties>;
};
