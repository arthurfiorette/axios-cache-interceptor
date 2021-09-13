import { AxiosInstance } from 'axios';
import { defaultHeaderInterpreter } from '../header';
import { applyRequestInterceptor } from '../interceptors/request';
import { applyResponseInterceptor } from '../interceptors/response';
import { MemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../util/key-generator';
import CacheInstance, { AxiosCacheInstance, CacheProperties } from './types';

export function createCache(
  axios: AxiosInstance,
  options: Partial<CacheInstance> & Partial<CacheProperties> = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = options.storage || new MemoryStorage();
  axiosCache.generateKey = options.generateKey || defaultKeyGenerator;
  axiosCache.waiting = options.waiting || {};
  axiosCache.headerInterpreter = options.headerInterpreter || defaultHeaderInterpreter;

  // CacheRequestConfig values
  axiosCache.defaults = {
    ...axios.defaults,
    cache: {
      ttl: 1000 * 60 * 5,
      interpretHeader: false,
      methods: ['get'],
      cachePredicate: { statusCheck: [200, 399] },
      update: {},
      ...options
    }
  };

  // Apply interceptors
  applyRequestInterceptor(axiosCache);
  applyResponseInterceptor(axiosCache);

  return axiosCache;
}
