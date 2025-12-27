import type { AxiosResponseHeaders } from 'axios';
import { parse } from 'cache-parser';
import { parse as parseVary } from 'http-vary';
import type { AxiosCacheInstance, CacheAxiosResponse, CacheRequestConfig } from '../cache/axios.js';
import type { CacheProperties } from '../cache/cache.js';
import { extractHeaders } from '../header/extract.js';
import { Header } from '../header/headers.js';
import type { CachedStorageValue } from '../storage/types.js';
import { testCachePredicate } from '../util/cache-predicate.js';
import { updateCache } from '../util/update-cache.js';
import type { ResponseInterceptor } from './build.js';
import { createCacheResponse, isMethodIn } from './util.js';

export function defaultResponseInterceptor(axios: AxiosCacheInstance): ResponseInterceptor {
  /**
   * Replies a deferred stored in the axios waiting map. Use resolve to proceed checking the
   * previously updated cache or reject to abort deduplicated requests with error.
   */
  const replyDeferred = (responseId: string, mode: 'reject' | 'resolve', error?: any) => {
    // Rejects the deferred, if present
    const deferred = axios.waiting.get(responseId);

    if (deferred) {
      deferred[mode](error);
      axios.waiting.delete(responseId);

      if (__ACI_DEV__) {
        axios.debug({
          id: responseId,
          msg: `Found waiting deferred(s) and ${mode} them`
        });
      }
    }
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

      // On limited storage scenarios, its possible the request was evicted while waiting
      // for the response, in this case, state will be 'empty' again instead of loading.
      // https://github.com/arthurfiorette/axios-cache-interceptor/issues/833
      axios.waiting.delete(response.id);
      return response;
    }

    // Config told that this response should not be cached.
    if (
      // For 'loading' values (previous: stale), this check already ran in the past.
      !cache.data &&
      !(await testCachePredicate(response, cacheConfig.cachePredicate))
    ) {
      replyDeferred(response.id, 'resolve');

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
      const expirationTime = axios.headerInterpreter(response.headers, axios.location);

      // Cache should not be used
      if (expirationTime === 'dont cache') {
        replyDeferred(response.id, 'resolve');

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

    if (typeof ttl === 'function') {
      ttl = await ttl(response);
    }

    const data = createCacheResponse(response, cache.data);

    // Either stales response (Vary *) or sets request Vary headers into metadata
    if (cacheConfig.vary !== false && response.headers[Header.Vary]) {
      const vary = Array.isArray(cacheConfig.vary)
        ? cacheConfig.vary
        : parseVary(response.headers[Header.Vary]);

      // For valid values, store the subset of request headers in the cache response
      if (Array.isArray(vary)) {
        data.meta ??= {};
        data.meta.vary = extractHeaders(config.headers, vary);

        if (__ACI_DEV__) {
          axios.debug({
            id: response.id,
            msg: 'Storing response with Vary metadata',
            data: { vary, extracted: data.meta.vary }
          });
        }

        // RFC States * must revalidate every time per RFC 9110.
      } else if (vary === '*') {
        if (__ACI_DEV__) {
          axios.debug({
            id: response.id,
            msg: 'Response has Vary: * - storing as stale'
          });
        }

        // Marks cache as stale immediately
        await axios.storage.set(
          response.id,
          {
            state: 'stale',
            createdAt: Date.now(),
            data,
            ttl
          },
          config
        );

        replyDeferred(response.id, 'resolve');
        return response;
      }
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

    // Define this key as cache on the storage
    await axios.storage.set(response.id, newCache, config);
    replyDeferred(response.id, 'resolve');

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
      await axios.storage.remove(id, config);
      replyDeferred(id, 'reject', error);

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

      // Do not clear cache if this request is cached, but the request was cancelled before returning the cached response
      if (
        error.code !== 'ERR_CANCELED' ||
        (error.code === 'ERR_CANCELED' && cache.state !== 'cached')
      ) {
        await axios.storage.remove(id, config);
      }

      // Rejects all other requests waiting for this response
      replyDeferred(id, 'reject', error);

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
        // Resolve all other requests waiting for this response
        const waiting = axios.waiting.get(id);

        if (waiting) {
          waiting.resolve();
          axios.waiting.delete(id);

          if (__ACI_DEV__) {
            axios.debug({
              id,
              msg: 'Found waiting deferred(s) and resolved them'
            });
          }
        }

        if (__ACI_DEV__) {
          axios.debug({
            id,
            msg: 'staleIfError resolved this response with cached data',
            data: { error, config, cache }
          });
        }

        return {
          cached: true,
          stale: true,
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
    await axios.storage.remove(id, config);
    replyDeferred(id, 'reject', error);

    throw error;
  };

  return {
    onFulfilled,
    onRejected
  };
}
