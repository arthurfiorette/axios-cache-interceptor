import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { defaultHeaderInterpreter } from '../header';
import { CacheRequestInterceptor } from '../interceptors/request';
import { CacheResponseInterceptor } from '../interceptors/response';
import { MemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import CacheInstance, { AxiosCacheInstance, CacheProperties } from './types';

/**
 * Apply the caching interceptors for a already created axios instance.
 *
 * @param axios the already created axios instance
 * @param config the config for the caching interceptors
 * @returns the same instance but with caching enabled
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
  axiosCache.requestInterceptor = requestInterceptor || new CacheRequestInterceptor(axiosCache);
  axiosCache.responseInterceptor = responseInterceptor || new CacheResponseInterceptor(axiosCache);

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
 * @param config the config for the caching interceptors
 * @param axiosConfig the config for the created axios instance
 * @returns the same instance but with caching enabled
 */
export function createCache(
  config: Partial<CacheInstance> & Partial<CacheProperties> = {},
  axiosConfig: AxiosRequestConfig = {}
): AxiosCacheInstance {
  return applyCache(Axios.create(axiosConfig), config);
}
