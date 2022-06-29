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
  const rejectResponse = async (responseId: string, config: CacheRequestConfig) => {
    // Update the cache to empty to prevent infinite loading state
    await axios.storage.remove(responseId, config);

    // Reject the deferred if present
    axios.waiting[responseId]?.reject();

    delete axios.waiting[responseId];
  };

  const onFulfilled: ResponseInterceptor['onFulfilled'] = async (response) => {
    const id = (response.id = response.config.id ??= axios.generateKey(response.config));
    response.cached ??= false;

    // Response is already cached
    if (response.cached) {
      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Returned cached response'
        });
      }

      return response;
    }

    // Request interceptor merges defaults with per request configuration
    const cacheConfig = response.config.cache as CacheProperties;

    // Skip cache: either false or weird behavior
    // config.cache should always exists, at least from global config merge.
    if (!cacheConfig) {
      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Response with config.cache falsy',
          data: response
        });
      }

      return { ...response, cached: false };
    }

    const config = response.config;
    const cache = await axios.storage.get(id, config);

    // Update other entries before updating himself
    if (cacheConfig?.update) {
      await updateCache(axios.storage, response, cacheConfig.update);
    }

    if (
      // If the request interceptor had a problem or it wasn't cached
      cache.state !== 'loading'
    ) {
      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: "Response not cached and storage isn't loading",
          data: { cache, response }
        });
      }

      return response;
    }

    // Config told that this response should be cached.
    if (
      // For 'loading' values (previous: stale), this check already ran in the past.
      !cache.data &&
      !(await testCachePredicate(response, cacheConfig.cachePredicate))
    ) {
      await rejectResponse(id, config);

      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Cache predicate rejected this response'
        });
      }

      return response;
    }

    // Avoid remnant headers from remote server to break implementation
    for (const header of Object.keys(response.headers)) {
      if (header.startsWith('x-axios-cache')) {
        delete response.headers[header];
      }
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
        await rejectResponse(id, config);

        if (__ACI_DEV__) {
          axios.debug?.({
            id,
            msg: `Cache header interpreted as 'dont cache'`,
            data: { cache, response, expirationTime }
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
        id,
        msg: 'Useful response configuration found',
        data: { cacheConfig, cacheResponse: data }
      });
    }

    const newCache: CachedStorageValue = {
      state: 'cached',
      ttl,
      createdAt: Date.now(),
      data
    };

    // Resolve all other requests waiting for this response
    const waiting = axios.waiting[id];

    if (waiting) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waiting.resolve(newCache.data);
      delete axios.waiting[id];

      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Found waiting deferred(s) and resolved them'
        });
      }
    }

    // Define this key as cache on the storage
    await axios.storage.set(id, newCache, config);

    if (__ACI_DEV__) {
      axios.debug?.({
        id,
        msg: 'Response cached',
        data: { cache: newCache, response }
      });
    }

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  const onRejected: ResponseInterceptor['onRejected'] = async (error) => {
    const config = error.config as CacheRequestConfig;

    // config.cache should always exists, at least from global config merge.
    if (!config?.cache || !config.id) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Web request returned an error but cache handling is not enabled',
          data: { error }
        });
      }

      throw error;
    }

    const cache = await axios.storage.get(config.id, config);
    const cacheConfig = config.cache;

    if (
      // This will only not be loading if the interceptor broke
      cache.state !== 'loading' ||
      cache.previous !== 'stale'
    ) {
      await rejectResponse(config.id, config);

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
        await axios.storage.set(
          config.id,
          {
            state: 'stale',
            createdAt: Date.now(),
            data: cache.data
          },
          config
        );

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
