import type { AxiosCacheInstance } from '../cache/axios';
import type { CacheProperties } from '../cache/cache';
import type { CachedStorageValue } from '../storage/types';
import { testCachePredicate } from '../util/cache-predicate';
import { Header } from '../util/headers';
import { updateCache } from '../util/update-cache';
import type { ResponseInterceptor } from './build';
import { setupCacheData } from './util';

export function defaultResponseInterceptor(
  axios: AxiosCacheInstance
): ResponseInterceptor {
  /**
   * Rejects cache for an response response.
   *
   * Also update the waiting list for this key by rejecting it.
   */
  const rejectResponse = async (
    { storage, waiting }: AxiosCacheInstance,
    responseId: string
  ) => {
    // Update the cache to empty to prevent infinite loading state
    await storage.remove(responseId);
    // Reject the deferred if present
    waiting[responseId]?.reject(null);
    delete waiting[responseId];
  };

  const onFulfilled: ResponseInterceptor['onFulfilled'] = async (response) => {
    response.id ??= axios.generateKey(response.config);
    response.cached ??= false;

    // Response is already cached
    if (response.cached) {
      return response;
    }

    // Skip cache: either false or weird behavior
    // config.cache should always exists, at least from global config merge.
    if (!response.config.cache) {
      return { ...response, cached: false };
    }

    const cacheConfig = response.config.cache as CacheProperties;

    const cache = await axios.storage.get(response.id);

    if (
      // If the request interceptor had a problem
      cache.state === 'stale' ||
      cache.state === 'empty' ||
      // Should not hit here because of previous response.cached check
      cache.state === 'cached'
    ) {
      return response;
    }

    // Config told that this response should be cached.
    if (
      // For 'loading' values (post stale), this check was already run in the past.
      !cache.data &&
      !(await testCachePredicate(response, cacheConfig.cachePredicate))
    ) {
      await rejectResponse(axios, response.id);
      return response;
    }

    // avoid remnant headers from remote server to break implementation
    delete response.headers[Header.XAxiosCacheEtag];
    delete response.headers[Header.XAxiosCacheLastModified];

    if (cacheConfig.etag && cacheConfig.etag !== true) {
      response.headers[Header.XAxiosCacheEtag] = cacheConfig.etag;
    }

    if (cacheConfig.modifiedSince) {
      response.headers[Header.XAxiosCacheLastModified] =
        cacheConfig.modifiedSince === true
          ? 'use-cache-timestamp'
          : cacheConfig.modifiedSince.toUTCString();
    }

    let ttl = cacheConfig.ttl || -1; // always set from global config

    if (cacheConfig?.interpretHeader) {
      const expirationTime = axios.headerInterpreter(response.headers);

      // Cache should not be used
      if (expirationTime === 'dont cache') {
        await rejectResponse(axios, response.id);
        return response;
      }

      ttl = expirationTime === 'not enough headers' ? ttl : expirationTime;
    }

    const data = setupCacheData(response, cache.data);

    if (typeof ttl === 'function') {
      ttl = await ttl(response);
    }

    const newCache: CachedStorageValue = {
      state: 'cached',
      ttl,
      createdAt: Date.now(),
      data
    };

    // Update other entries before updating himself
    if (cacheConfig?.update) {
      updateCache(axios.storage, response, cacheConfig.update);
    }

    const deferred = axios.waiting[response.id];

    // Resolve all other requests waiting for this response
    await deferred?.resolve(newCache.data);
    delete axios.waiting[response.id];

    // Define this key as cache on the storage
    await axios.storage.set(response.id, newCache);

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  return {
    onFulfilled,
    apply: () => axios.interceptors.response.use(onFulfilled)
  };
}
