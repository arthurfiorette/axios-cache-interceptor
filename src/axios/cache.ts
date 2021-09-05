import { AxiosInstance } from 'axios';
import { applyRequestInterceptor } from '../interceptors/request';
import { applyResponseInterceptor } from '../interceptors/response';
import { MemoryStorage } from '../storage/memory';
import { defaultKeyGenerator } from '../utils/key-generator';
import { AxiosCacheInstance, CacheInstance, CacheRequestConfig } from './types';

type Options = CacheRequestConfig['cache'] & Partial<CacheInstance>;

export function createCache(axios: AxiosInstance, options: Options = {}): AxiosCacheInstance {
  const axiosCache = axios as AxiosCacheInstance;

  axiosCache.storage = options.storage || new MemoryStorage();
  axiosCache.generateKey = defaultKeyGenerator;

  // CacheRequestConfig values
  axiosCache.defaults = {
    ...axios.defaults,
    cache: {
      maxAge: 1000 * 60 * 5,
      interpretHeader: false,
      methods: ['get'],
      shouldCache: ({ status }) => status >= 200 && status < 300,
      update: {},
      ...options
    }
  };

  // Apply interceptors
  applyRequestInterceptor(axiosCache);
  applyResponseInterceptor(axiosCache);

  return axiosCache;
}
