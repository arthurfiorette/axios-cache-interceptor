import { AxiosCacheInstance, CacheProperties, createCache } from '../../src';
import CacheInstance from '../../src/axios/types';

export const axiosMock = {
  statusCode: 200,
  statusText: '200 Intercepted'
};

export function mockAxios(
  options: Partial<CacheInstance> & Partial<CacheProperties> = {},
  headers: Record<string, string> = {}
): AxiosCacheInstance {
  const axios = createCache({
    // Defaults to cache every request
    ...options
  });

  // Axios interceptors are a stack, so apply this after the cache interceptor
  axios.interceptors.request.use((config) => {
    config.adapter = async (config) => ({
      data: true,
      status: axiosMock.statusCode,
      statusText: axiosMock.statusText,
      headers,
      config
    });

    return config;
  });

  return axios;
}
