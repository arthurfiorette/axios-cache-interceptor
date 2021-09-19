import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { defaultHeaderInterpreter } from '../header';
import { applyRequestInterceptor } from '../interceptors/request';
import { applyResponseInterceptor } from '../interceptors/response';
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
  config: Partial<CacheInstance> & Partial<CacheProperties> = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = config.storage || new MemoryStorage();
  axiosCache.generateKey = config.generateKey || defaultKeyGenerator;
  axiosCache.waiting = config.waiting || {};
  axiosCache.headerInterpreter = config.headerInterpreter || defaultHeaderInterpreter;

  // CacheRequestConfig values
  axiosCache.defaults = {
    ...axios.defaults,
    cache: {
      ttl: 1000 * 60 * 5,
      interpretHeader: false,
      methods: ['get'],
      cachePredicate: { statusCheck: [200, 399] },
      update: {},
      ...config
    }
  };

  // Apply interceptors
  applyRequestInterceptor(axiosCache);
  applyResponseInterceptor(axiosCache);

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
