import type { CacheProperties } from '..';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';
import type { CachedStorageValue } from '../storage/types';
import { testCachePredicate } from '../util/cache-predicate';
import { Header } from '../util/headers';
import { updateCache } from '../util/update-cache';
import type { ResponseInterceptor } from './build';
import { createCacheResponse } from './util';

export function defaultResponseInterceptor(
  axios: AxiosCacheInstance
): ResponseInterceptor {
  /**
   * Rejects cache for an response response.
   *
   * Also update the waiting list for this key by rejecting it.
   */
  const rejectResponse = async (responseId: string) => {
    // Update the cache to empty to prevent infinite loading state
    await axios.storage.remove(responseId);
    // Reject the deferred if present
    axios.waiting[responseId]?.reject(null);
    delete axios.waiting[responseId];
  };

  const onFulfilled: ResponseInterceptor['onFulfilled'] = async (response) => {
    response.id = response.config.id ??= axios.generateKey(response.config);
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

    // Request interceptor merges defaults with per request configuration
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
      await rejectResponse(response.id);
      return response;
    }

    // avoid remnant headers from remote server to break implementation
    for (const header in Header) {
      if (!header.startsWith('XAxiosCache')) {
        continue;
      }

      delete response.headers[header];
    }

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
        await rejectResponse(response.id);
        return response;
      }

      ttl = expirationTime === 'not enough headers' ? ttl : expirationTime;
    }

    const data = createCacheResponse(response, cache.data);

    if (typeof ttl === 'function') {
      ttl = await ttl(response);
    }

    if (cacheConfig.staleIfError) {
      response.headers[Header.XAxiosCacheStaleIfError] = String(ttl);
    }

    // Update other entries before updating himself
    if (cacheConfig?.update) {
      await updateCache(axios.storage, response, cacheConfig.update);
    }

    const newCache: CachedStorageValue = {
      state: 'cached',
      ttl,
      createdAt: Date.now(),
      data
    };

    // Resolve all other requests waiting for this response
    axios.waiting[response.id]?.resolve(newCache.data);
    delete axios.waiting[response.id];

    // Define this key as cache on the storage
    await axios.storage.set(response.id, newCache);

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  const onRejected: ResponseInterceptor['onRejected'] = async (error) => {
    const config = error['config'] as CacheRequestConfig;

    if (!config || config.cache === false || !config.id) {
      throw error;
    }

    const cache = await axios.storage.get(config.id);
    const cacheConfig = config.cache;

    if (
      // This will only not be loading if the interceptor broke
      cache.state !== 'loading' ||
      cache.previous !== 'stale'
    ) {
      await rejectResponse(config.id);
      throw error;
    }

    if (cacheConfig?.staleIfError) {
      const staleIfError =
        typeof cacheConfig.staleIfError === 'function'
          ? await cacheConfig.staleIfError(
              error.response as CacheAxiosResponse,
              cache,
              error
            )
          : cacheConfig.staleIfError;

      if (
        staleIfError === true ||
        // staleIfError is the number of seconds that stale is allowed to be used
        (typeof staleIfError === 'number' && cache.createdAt + staleIfError > Date.now())
      ) {
        const newCache: CachedStorageValue = {
          state: 'cached',
          ttl: Number(cache.data.headers[Header.XAxiosCacheStaleIfError]),
          createdAt: Date.now(),
          data: cache.data
        };

        const response: CacheAxiosResponse = {
          cached: true,
          config,
          id: config.id,
          data: cache.data?.data,
          headers: cache.data?.headers,
          status: cache.data.status,
          statusText: cache.data.statusText
        };

        // Resolve all other requests waiting for this response
        axios.waiting[response.id]?.resolve(newCache.data);
        delete axios.waiting[response.id];

        // Valid response
        return response;
      }
    }

    // Reject this response and rethrows the error
    await rejectResponse(config.id);
    throw error;
  };

  return {
    onFulfilled,
    onRejected,
    apply: () => axios.interceptors.response.use(onFulfilled, onRejected)
  };
}
