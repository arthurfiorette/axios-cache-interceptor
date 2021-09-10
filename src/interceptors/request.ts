import { AxiosCacheInstance } from '../axios/types';
import { CACHED_RESPONSE_STATUS, CACHED_RESPONSE_STATUS_TEXT } from '../constants';
import { Deferred } from '../utils/deferred';

export function applyRequestInterceptor(axios: AxiosCacheInstance) {
  axios.interceptors.request.use(async (config) => {
    // Only cache specified methods
    if (config.cache?.methods?.some((method) => (config.method || 'get').toLowerCase() == method)) {
      return config;
    }

    const key = axios.generateKey(config);
    const cache = await axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    if (cache.state == 'empty') {
      await axios.storage.set(key, {
        state: 'loading',
        data: new Deferred(),
        // The cache header will be set after the response has been read, until that time, the expiration will be -1
        expiration: config.cache?.interpretHeader
          ? -1
          : config.cache?.maxAge || axios.defaults.cache.maxAge
      });
      return config;
    }

    // Only check for expiration if the cache exists, because if it is loading, the expiration value may be -1.
    if (cache.state === 'cached' && cache.expiration < Date.now()) {
      await axios.storage.remove(key);
      return config;
    }

    const { body, headers } = await cache.data;

    config.adapter = () =>
      Promise.resolve({
        data: body,
        config,
        headers,
        status: CACHED_RESPONSE_STATUS,
        statusText: CACHED_RESPONSE_STATUS_TEXT
      });

    return config;
  });
}
