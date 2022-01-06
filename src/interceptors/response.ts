import type { AxiosResponse } from 'axios';
import type { AxiosCacheInstance, CacheAxiosResponse } from '../cache/axios';
import type { CacheProperties } from '../cache/cache';
import type { CachedStorageValue } from '../storage/types';
import { shouldCacheResponse } from '../util/cache-predicate';
import { Header } from '../util/headers';
import { updateCache } from '../util/update-cache';
import type { AxiosInterceptor } from './types';
import { setupCacheData } from './util';

export class CacheResponseInterceptor
  implements AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>
{
  constructor(readonly axios: AxiosCacheInstance) {}

  readonly use = (): void => {
    this.axios.interceptors.response.use(this.onFulfilled);
  };

  readonly onFulfilled = async (
    axiosResponse: AxiosResponse<unknown, unknown>
  ): Promise<CacheAxiosResponse<unknown, unknown>> => {
    const response = this.cachedResponse(axiosResponse);

    // Response is already cached
    if (response.cached) {
      return response;
    }

    // Skip cache
    // either false or weird behavior, config.cache should always exists, from global config merge at least
    if (!response.config.cache) {
      return { ...response, cached: false };
    }

    const cacheConfig = response.config.cache as CacheProperties;

    const cache = await this.axios.storage.get(response.id);

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
      !shouldCacheResponse(response, cacheConfig)
    ) {
      await this.rejectResponse(response.id);
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
      const expirationTime = this.axios.headerInterpreter(response.headers);

      // Cache should not be used
      if (expirationTime === 'dont cache') {
        await this.rejectResponse(response.id);
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
      updateCache(this.axios.storage, response, cacheConfig.update);
    }

    const deferred = this.axios.waiting[response.id];

    // Resolve all other requests waiting for this response
    await deferred?.resolve(newCache.data);
    delete this.axios.waiting[response.id];

    // Define this key as cache on the storage
    await this.axios.storage.set(response.id, newCache);

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  /** Rejects cache for this response. Also update the waiting list for this key by rejecting it. */
  readonly rejectResponse = async (key: string) => {
    // Update the cache to empty to prevent infinite loading state
    await this.axios.storage.remove(key);
    // Reject the deferred if present
    this.axios.waiting[key]?.reject(null);
    delete this.axios.waiting[key];
  };

  readonly cachedResponse = (
    response: AxiosResponse<unknown, unknown>
  ): CacheAxiosResponse<unknown, unknown> => {
    return {
      id: this.axios.generateKey(response.config),
      // The request interceptor response.cache will return true or undefined. And true only when the response was cached.

      cached: (response as CacheAxiosResponse<unknown, unknown>).cached || false,
      ...response
    };
  };
}
