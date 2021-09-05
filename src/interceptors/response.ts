import { parse } from '@tusbar/cache-control';
import { AxiosCacheInstance } from '../axios/types';

export function applyResponseInterceptor(axios: AxiosCacheInstance) {
  axios.interceptors.response.use(async (response) => {
    // Update other entries before updating himself
    for (const [cacheKey, value] of Object.entries(response.config.cache?.update || {})) {
      if (value == 'delete') {
        await axios.storage.remove(cacheKey);
        continue;
      }

      const oldValue = await axios.storage.get(cacheKey);
      const newValue = value(oldValue, response.data);
      if (newValue !== undefined) {
        await axios.storage.set(cacheKey, newValue);
      } else {
        await axios.storage.remove(cacheKey);
      }
    }

    // Config told that this response should be cached.
    if (!response.config.cache?.shouldCache!(response)) {
      return response;
    }

    const key = axios.generateKey(response.config);
    const cache = await axios.storage.get(key);

    if (
      // Response already is in cache.
      cache.state === 'cached' ||
      // Received response without being intercepted in the response
      cache.state === 'empty'
    ) {
      return response;
    }

    if (response.config.cache?.interpretHeader) {
      const cacheControl = response.headers['cache-control'] || '';
      const { noCache, noStore, maxAge } = parse(cacheControl);

      // Header told that this response should not be cached.
      if (noCache || noStore) {
        return response;
      }

      const expirationTime = maxAge
        ? // Header max age in seconds
          Date.now() + maxAge * 1000
        : response.config.cache?.maxAge || axios.defaults.cache!.maxAge!;

      cache.expiration = expirationTime;
    } else {
      // If the cache expiration has not been set, use the default expiration.
      cache.expiration =
        cache.expiration || response.config.cache?.maxAge || axios.defaults.cache!.maxAge!;
    }

    const data = { body: response.data, headers: response.headers };

    // Resolve this deferred to update the cache after it
    cache.data.resolve(data);

    await axios.storage.set(key, {
      data,
      expiration: cache.expiration,
      state: 'cached'
    });

    return response;
  });
}
