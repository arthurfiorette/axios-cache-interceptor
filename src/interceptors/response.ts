import type { CacheProperties } from '..';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';
import { Header } from '../header/headers';
import type { CachedStorageValue } from '../storage/types';
import { testCachePredicate } from '../util/cache-predicate';
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
      if (__ACI_DEV__) {
        axios.debug?.({
          id: response.id,
          msg: 'Returned cached response'
        });
      }

      return response;
    }

    // Skip cache: either false or weird behavior
    // config.cache should always exists, at least from global config merge.
    if (!response.config.cache) {
      if (__ACI_DEV__) {
        axios.debug?.({
          id: response.id,
          msg: 'Response with config.cache === false',
          data: response
        });
      }

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
      if (__ACI_DEV__) {
        axios.debug?.({
          id: response.id,
          msg: 'Response not cached but storage is not loading',
          data: { cache, response }
        });
      }

      return response;
    }

    // Config told that this response should be cached.
    if (
      // For 'loading' values (post stale), this check was already run in the past.
      !cache.data &&
      !(await testCachePredicate(response, cacheConfig.cachePredicate))
    ) {
      await rejectResponse(response.id);
      if (__ACI_DEV__) {
        axios.debug?.({
          id: response.id,
          msg: 'Cache predicate rejected this response'
        });
      }

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

        if (__ACI_DEV__) {
          axios.debug?.({
            id: response.id,
            msg: `Cache header interpreted as 'dont cache'`,
            data: {
              cache,
              response,
              expirationTime
            }
          });
        }

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

    if (__ACI_DEV__) {
      axios.debug?.({
        id: response.id,
        msg: 'Useful response configuration found',
        data: { cacheConfig, ttl, cacheResponse: data }
      });
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
    const waiting = axios.waiting[response.id];
    if (waiting) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waiting.resolve(newCache.data);
      delete axios.waiting[response.id];

      if (__ACI_DEV__) {
        axios.debug?.({
          id: response.id,
          msg: 'Found waiting deferred(s) and resolved them'
        });
      }
    }

    // Define this key as cache on the storage
    await axios.storage.set(response.id, newCache);

    if (__ACI_DEV__) {
      axios.debug?.({
        id: response.id,
        msg: 'Response cached',
        data: { cache: newCache, response }
      });
    }

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  const onRejected: ResponseInterceptor['onRejected'] = async (error) => {
    const config = error['config'] as CacheRequestConfig;

    if (!config || config.cache === false || !config.id) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Web request returned an error but cache handling is not enabled',
          data: { error, config }
        });
      }

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

      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Caught an error in the request interceptor',
          data: { error, config }
        });
      }

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

      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Found cache if stale config for rejected response',
          data: { error, config, staleIfError }
        });
      }

      if (
        staleIfError === true ||
        // staleIfError is the number of seconds that stale is allowed to be used
        (typeof staleIfError === 'number' && cache.createdAt + staleIfError > Date.now())
      ) {
        // Resolve all other requests waiting for this response
        axios.waiting[config.id]?.resolve(cache.data);
        delete axios.waiting[config.id];

        // re-mark the cache as stale
        await axios.storage.set(config.id, {
          state: 'stale',
          createdAt: Date.now(),
          data: cache.data
        });

        if (__ACI_DEV__) {
          axios.debug?.({
            msg: 'staleIfError resolved this response with cached data',
            data: { error, config, cache }
          });
        }

        return {
          cached: true,
          config,
          id: config.id,
          data: cache.data.data,
          headers: cache.data.headers,
          status: cache.data.status,
          statusText: cache.data.statusText
        };
      }
    }

    if (__ACI_DEV__) {
      axios.debug?.({
        msg: 'Received an unknown error that could not be handled',
        data: { error, config }
      });
    }

    throw error;
  };

  return {
    onFulfilled,
    onRejected,
    apply: () => axios.interceptors.response.use(onFulfilled, onRejected)
  };
}
