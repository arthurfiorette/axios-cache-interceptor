import { AxiosCacheInstance } from '../axios/types';
import { updateCache } from '../util/update-cache';

export function applyResponseInterceptor(axios: AxiosCacheInstance): void {
  axios.interceptors.response.use(async (response) => {
    // Update other entries before updating himself
    if (response.config.cache?.update) {
      updateCache(axios, response.data, response.config.cache.update);
    }

    const shouldCache = response.config.cache?.shouldCache || axios.defaults.cache.shouldCache;

    // Config told that this response should be cached.
    if (shouldCache(response)) {
      return response;
    }

    const key = axios.generateKey(response.config);
    const cache = await axios.storage.get(key);

    // Response already is in cache or received without
    // being intercepted in the response
    if (cache.state === 'cached' || cache.state === 'empty') {
      return response;
    }

    const defaultMaxAge = response.config.cache?.maxAge || axios.defaults.cache.maxAge;
    cache.expiration = cache.expiration || defaultMaxAge;
    let saveCache = true;

    if (response.config.cache?.interpretHeader) {
      const expirationTime = axios.interpretHeader(response.headers['cache-control']);

      // Header told that this response should not be cached.
      if (expirationTime === false) {
        saveCache = false;
      } else {
        cache.expiration = expirationTime ? expirationTime : defaultMaxAge;
      }
    }

    const data = { body: response.data, headers: response.headers };
    const deferred = axios.waiting[key];

    // Resolve all other requests waiting for this response
    if (deferred) {
      deferred.resolve(data);
    }

    if (saveCache) {
      await axios.storage.set(key, {
        data,
        expiration: cache.expiration,
        state: 'cached'
      });
    }

    return response;
  });
}
