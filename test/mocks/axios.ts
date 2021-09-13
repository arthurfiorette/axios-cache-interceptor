import axios from 'axios';
import { AxiosCacheInstance, CacheProperties, createCache } from '../../src';
import CacheInstance from '../../src/axios/types';

export const axiosMock = {
  /**
   * Simple request url to be used, doesn't matter at all because network
   * requests are intercepted by a custom adapter.
   */
  url: 'https://github.com/ArthurFiorette/axios-cache-interceptor/',
  statusCode: -1,
  statusText: '-1 Intercepted'
};

export function mockAxios(
  options?: Partial<CacheInstance> & Partial<CacheProperties>
): AxiosCacheInstance {
  // A simple jest that resolves every request with this response
  const api = axios.create();

  const cachedApi = createCache(api, {
    // Defaults to cache every request
    cachePredicate: () => true,
    ...options
  });

  cachedApi.interceptors.request.use((config) => {
    config.adapter = async (config) => ({
      data: true,
      status: axiosMock.statusCode,
      statusText: axiosMock.statusText,
      headers: {},
      config
    });

    return config;
  });

  return cachedApi;
}
