import Axios from 'axios';
import { AxiosCacheInstance, CacheProperties, createCache } from '../../src';
import type { CacheInstance } from '../../src/cache/cache';
import { Header } from '../../src/util/headers';

export const XMockRandom = 'x-mock-random';

export function mockAxios(
  options: Partial<CacheInstance> & Partial<CacheProperties> = {},
  responseHeaders: Record<string, string> = {}
): AxiosCacheInstance {
  const axios = createCache(Axios.create(), options);

  // Axios interceptors are a stack, so apply this after the cache interceptor
  axios.interceptors.request.use((config) => {
    config.adapter = async (config) => {
      await 0; // Jumps to next tick of nodejs event loop

      const should304 =
        config.headers?.[Header.IfNoneMatch] || config.headers?.[Header.IfModifiedSince];
      const status = should304 ? 304 : 200;

      // real axios would throw an error here.
      config.validateStatus?.(status);

      return {
        data: true,
        status,
        statusText: should304 ? '304 Not Modified' : '200 OK',
        headers: {
          ...responseHeaders,
          // Random header for every request made
          [XMockRandom]: `${Math.random()}`
        },
        config
      };
    };

    return config;
  });

  return axios;
}
