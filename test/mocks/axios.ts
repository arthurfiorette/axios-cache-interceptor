import { AxiosCacheInstance, CacheProperties, createCache } from '../../src';
import type { CacheInstance } from '../../src/cache/cache';

export function mockAxios(
  options: Partial<CacheInstance> & Partial<CacheProperties> = {},
  headers: Record<string, string> = {}
): AxiosCacheInstance {
  const axios = createCache({
    cache: options
  });

  // Axios interceptors are a stack, so apply this after the cache interceptor
  axios.interceptors.request.use((config) => {
    config.adapter = async (config) => {
      if (config.headers && (config.headers['if-none-match'] || config.headers['if-modified-since'])) {
        return {
          data: null,
          status: 304,
          statusText: '304 Not Modified',
          headers,
          config
        };
      } else {
        return {
          data: true,
          status: 200,
          statusText: '200 OK',
          headers,
          config
        };
      }
    };

    return config;
  });

  return axios;
}
