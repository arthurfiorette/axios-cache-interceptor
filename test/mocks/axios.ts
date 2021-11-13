import { AxiosCacheInstance, CacheProperties, createCache } from '../../src';
import type { CacheInstance } from '../../src/cache/cache';
import { Header } from '../../src/util/headers';

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
      await 0; // Jumps to next tick of nodejs event loop

      const should304 =
        config.headers?.[Header.IfNoneMatch] || config.headers?.[Header.IfModifiedSince];
      const status = should304 ? 304 : 200;

      config.validateStatus && config.validateStatus(status);

      return {
        data: true,
        status,
        statusText: should304 ? '304 Not Modified' : '200 OK',
        headers,
        config
      };
    };

    return config;
  });

  return axios;
}
