import { AxiosInstance } from 'axios';
import { applyRequestInterceptor } from '../interceptors/request';
import { applyResponseInterceptor } from '../interceptors/response';
import { MemoryStorage } from '../storage/memory';
import { AxiosCacheInstance, CacheInstance, CacheRequestConfig } from './types';

type Options = CacheRequestConfig['cache'] & Partial<CacheInstance>;

export function createCache(
  axios: AxiosInstance,
  options: Options = {}
): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = options.storage || new MemoryStorage();

  // CacheRequestConfig values
  axiosCache.defaults = {
    ...axios.defaults,
    cache: {
      maxAge: 1000 * 60 * 5,
      interpretHeader: false,
      methods: ['get'],
      ...options
    }
  };

  // Apply interceptors
  applyRequestInterceptor(axiosCache);
  applyResponseInterceptor(axiosCache);

  return axiosCache;
}
