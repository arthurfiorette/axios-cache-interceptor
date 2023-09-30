import type { AxiosResponseHeaders } from 'axios';
import { parse } from 'cache-parser';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';
import type { CacheProperties } from '../cache/cache';
import { Header } from '../header/headers';
import type { CachedStorageValue } from '../storage/types';
import { testCachePredicate } from '../util/cache-predicate';
import { updateCache } from '../util/update-cache';
import type { ResponseInterceptor } from './build';
import { createCacheResponse, isMethodIn } from './util';

export function defaultResponseInterceptor(
  axios: AxiosCacheInstance
): ResponseInterceptor {
  /**
   * Rejects cache for an response response.
   *
   * Also update the waiting list for this key by rejecting it.
   */
  const rejectResponse = async (responseId: string, config: CacheRequestConfig) => {
    // Updates the cache to empty to prevent infinite loading state
    await axios.storage.remove(responseId, config);

    // Rejects the deferred, if present
    axios.waiting[responseId]?.reject();

    delete axios.waiting[responseId];
  };

  const onFulfilled: ResponseInterceptor['onFulfilled'] = async (response) => {
    // When response.config is not present, the response is indeed a error.
    if (!response?.config) {
      if (__ACI_DEV__) {
        axios.debug({
          msg: 'Response interceptor received an unknown response.',
          data: response
        });
      }

      // Re-throws the error
      throw response;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    response.id = response.config.id!;
    response.cached ??= false;

    const config = response.config;
    // Request interceptor merges defaults with per request configuration
    const cacheConfig = config.cache as CacheProperties;

    // Response is already cached
    if (response.cached) {
      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
          msg: 'Returned cached response'
        });
      }

      return response;
    }

    // Skip cache: either false or weird behavior
    // config.cache should always exists, at least from global config merge.
    if (!cacheConfig) {
      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
          msg: 'Response with config.cache falsy',
          data: response
        });
      }

      response.cached = false;
      return response;
    }

    // Update other entries before updating himself
    if (cacheConfig.update) {
      await updateCache(axios.storage, response, cacheConfig.update);
    }

    if (!isMethodIn(config.method, cacheConfig.methods)) {
      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
          msg: `Ignored because method (${config.method}) is not in cache.methods (${cacheConfig.methods})`,
          data: { config, cacheConfig }
        });
      }

      return response;
    }

    const cache = await axios.storage.get(response.id, config);

    if (
      // If the request interceptor had a problem or it wasn't cached
      cache.state !== 'loading'
    ) {
      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
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
      await rejectResponse(response.id, config);

      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
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
    let staleTtl: number | undefined;

    if (cacheConfig.interpretHeader) {
      const expirationTime = axios.headerInterpreter(response.headers);

      // Cache should not be used
      if (expirationTime === 'dont cache') {
        await rejectResponse(response.id, config);

        if (__ACI_DEV__) {
          axios.debug({
            id: response.id,
            msg: `Cache header interpreted as 'dont cache'`,
            data: { cache, response, expirationTime }
          });
        }

        return response;
      }

      if (expirationTime !== 'not enough headers') {
        if (typeof expirationTime === 'number') {
          ttl = expirationTime;
        } else {
          ttl = expirationTime.cache;
          staleTtl = expirationTime.stale;
        }
      }
    }

    const data = createCacheResponse(response, cache.data);

    if (typeof ttl === 'function') {
      ttl = await ttl(response);
    }

    if (cacheConfig.staleIfError) {
      response.headers[Header.XAxiosCacheStaleIfError] = String(ttl);
    }

    if (__ACI_DEV__) {
      axios.debug({
        id: response.id,
        msg: 'Useful response configuration found',
        data: { cacheConfig, cacheResponse: data }
      });
    }

    const newCache: CachedStorageValue = {
      state: 'cached',
      ttl,
      staleTtl,
      createdAt: Date.now(),
      data
    };

    // Resolve all other requests waiting for this response
    const waiting = axios.waiting[response.id];

    if (waiting) {
      waiting.resolve(newCache.data);
      delete axios.waiting[response.id];

      if (__ACI_DEV__) {
        axios.debug({
          id: response.id,
          msg: 'Found waiting deferred(s) and resolved them'
        });
      }
    }

    // Define this key as cache on the storage
    await axios.storage.set(response.id, newCache, config);

    if (__ACI_DEV__) {
      axios.debug({
        id: response.id,
        msg: 'Response cached',
        data: { cache: newCache, response }
      });
    }

    // Return the response with cached as false, because it was not cached at all
    return response;
  };

  const onRejected: ResponseInterceptor['onRejected'] = async (error) => {
    // When response.config is not present, the response is indeed a error.
    if (!error.isAxiosError || !error.config) {
      if (__ACI_DEV__) {
        axios.debug({
          msg: 'FATAL: Received an non axios error in the rejected response interceptor, ignoring.',
          data: error
        });
      }

      // We should probably re-request the response to avoid an infinite loading state here
      // but, since this is an unknown error, we cannot figure out what request ID to use.
      // And the only solution is to let the storage actively reject the current loading state.
      throw error;
    }

    const config = error.config as CacheRequestConfig & { headers: AxiosResponseHeaders };
    const id = config.id;
    const cacheConfig = config.cache as CacheProperties;
    const response = error.response as CacheAxiosResponse | undefined;

    // config.cache should always exist, at least from global config merge.
    if (!cacheConfig || !id) {
      if (__ACI_DEV__) {
        axios.debug({
          msg: 'Web request returned an error but cache handling is not enabled',
          data: { error }
        });
      }

      throw error;
    }

    if (!isMethodIn(config.method, cacheConfig.methods)) {
      if (__ACI_DEV__) {
        axios.debug({
          id,
          msg: `Ignored because method (${config.method}) is not in cache.methods (${cacheConfig.methods})`,
          data: { config, cacheConfig }
        });
      }

      // Rejects all other requests waiting for this response
      await rejectResponse(id, config);

      throw error;
    }

    const cache = await axios.storage.get(id, config);

    if (
      // This will only not be loading if the interceptor broke
      cache.state !== 'loading' ||
      cache.previous !== 'stale'
    ) {
      if (__ACI_DEV__) {
        axios.debug({
          id,
          msg: 'Caught an error in the request interceptor',
          data: { cache, error, config }
        });
      }

      // Rejects all other requests waiting for this response
      await rejectResponse(id, config);

      throw error;
    }

    if (cacheConfig.staleIfError) {
      const cacheControl = String(response?.headers[Header.CacheControl]);
      const staleHeader = cacheControl && parse(cacheControl).staleIfError;

      const staleIfError =
        typeof cacheConfig.staleIfError === 'function'
          ? await cacheConfig.staleIfError(response, cache, error)
          : cacheConfig.staleIfError === true && staleHeader
          ? staleHeader * 1000 //staleIfError is in seconds
          : cacheConfig.staleIfError;

      if (__ACI_DEV__) {
        axios.debug({
          id,
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
        axios.waiting[id]?.resolve(cache.data);
        delete axios.waiting[id];

        // re-mark the cache as stale
        await axios.storage.set(
          id,
          {
            state: 'stale',
            createdAt: Date.now(),
            data: cache.data
          },
          config
        );

        if (__ACI_DEV__) {
          axios.debug({
            id,
            msg: 'staleIfError resolved this response with cached data',
            data: { error, config, cache }
          });
        }

        return {
          cached: true,
          config,
          id,
          data: cache.data.data,
          headers: cache.data.headers,
          status: cache.data.status,
          statusText: cache.data.statusText
        };
      }
    }

    if (__ACI_DEV__) {
      axios.debug({
        id,
        msg: 'Received an unknown error that could not be handled',
        data: { error, config }
      });
    }

    // Rejects all other requests waiting for this response
    await rejectResponse(id, config);

    throw error;
  };

  return {
    onFulfilled,
    onRejected,
    apply: () => axios.interceptors.response.use(onFulfilled, onRejected)
  };
}
