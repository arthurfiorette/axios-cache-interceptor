import { deferred } from 'fast-defer';
import { compare as compareVary, parse as parseVary } from 'http-vary';
import type { AxiosCacheInstance, CacheAxiosResponse } from '../cache/axios.js';
import { extractHeaders } from '../header/extract.js';
import { Header } from '../header/headers.js';
import type { CachedResponse, LoadingStorageValue } from '../storage/types.js';
import { regexOrStringMatch } from '../util/cache-predicate.js';
import type { RequestInterceptor } from './build.js';
import {
  type ConfigWithCache,
  createValidateStatus,
  isMethodIn,
  updateStaleRequest
} from './util.js';

export function defaultRequestInterceptor(axios: AxiosCacheInstance): RequestInterceptor {
  const onFulfilled: RequestInterceptor['onFulfilled'] = async (config) => {
    config.id = axios.generateKey(config, {
      vary:
        config.cache && Array.isArray(config.cache.vary)
          ? extractHeaders(config.headers, config.cache.vary)
          : undefined
    });

    if (config.cache === false) {
      if (__ACI_DEV__) {
        axios.debug({
          id: config.id,
          msg: 'Cache disabled: config.cache === false'
        });
      }

      return config;
    }

    // merge defaults with per request configuration
    config.cache = { ...axios.defaults.cache, ...config.cache };

    // Check if cache is disabled via enabled flag
    if (config.cache.enabled === false) {
      if (__ACI_DEV__) {
        axios.debug({
          id: config.id,
          msg: 'Cache disabled: config.cache.enabled === false'
        });
      }

      return config;
    }

    // ignoreUrls (blacklist)
    if (
      typeof config.cache.cachePredicate === 'object' &&
      config.cache.cachePredicate.ignoreUrls &&
      config.url
    ) {
      for (const url of config.cache.cachePredicate.ignoreUrls) {
        if (regexOrStringMatch(url, config.url)) {
          if (__ACI_DEV__) {
            axios.debug({
              id: config.id,
              msg: `URL ignored: matches ignoreUrls pattern`,
              data: { url: config.url, pattern: url }
            });
          }

          return config;
        }
      }
    }

    // allowUrls
    if (
      typeof config.cache.cachePredicate === 'object' &&
      config.cache.cachePredicate.allowUrls &&
      config.url
    ) {
      let matched = false;

      for (const url of config.cache.cachePredicate.allowUrls) {
        if (regexOrStringMatch(url, config.url)) {
          matched = true;

          if (__ACI_DEV__) {
            axios.debug({
              id: config.id,
              msg: `URL allowed: matches allowUrls pattern`,
              data: { url: config.url, pattern: url }
            });
          }
          break;
        }
      }

      if (!matched) {
        if (__ACI_DEV__) {
          axios.debug({
            id: config.id,
            msg: `URL rejected: not in allowUrls`,
            data: { url: config.url, allowUrls: config.cache.cachePredicate.allowUrls }
          });
        }
        return config;
      }
    }

    // Applies sufficient headers to prevent other cache systems to work along with this one
    //
    // Its currently used before isMethodIn because if the isMethodIn returns false, the request
    // shouldn't be cached an therefore neither in the browser.
    // https://stackoverflow.com/a/2068407
    if (config.cache.cacheTakeover) {
      config.headers[Header.CacheControl] ??= 'no-cache, no-store, must-revalidate, max-age=0';
      config.headers[Header.Pragma] ??= 'no-cache';
      config.headers[Header.Expires] ??= '0';
    }

    if (!isMethodIn(config.method, config.cache.methods)) {
      if (__ACI_DEV__) {
        axios.debug({
          id: config.id,
          msg: `Method ${config.method} not cacheable (allowed: ${config.cache.methods})`
        });
      }

      return config;
    }

    // Assumes that the storage handled staled responses
    let cache = await axios.storage.get(config.id, config);
    const overrideCache = config.cache.override;

    // Checks for vary mismatches in cached responses before proceeding
    // If a vary mismatch is detected, it will generate a new key based on the
    // current request headers and re-fetch the cache.
    if (
      // Vary enabled
      config.cache.vary !== false &&
      // Had vary headers in cached response (cached or stale)
      cache.data?.meta?.vary &&
      // Previous response had Vary header to use
      cache.data.headers[Header.Vary]
    ) {
      const vary = Array.isArray(config.cache.vary)
        ? config.cache.vary
        : parseVary(cache.data.headers[Header.Vary]);

      // Compares current request headers with cached vary headers (meta.vary)
      if (vary && vary !== '*' && !compareVary(vary, cache.data.meta?.vary, config.headers)) {
        // Generate base key without id field (otherwise returns config.id)
        const newKey = axios.generateKey(
          { ...config, id: undefined },
          { vary: extractHeaders(config.headers, vary) }
        );

        // If ends up being a new key, change the cache to the new one
        if (config.id !== newKey) {
          if (__ACI_DEV__) {
            axios.debug({
              id: config.id,
              msg: 'Vary mismatch: switching to vary-aware key',
              data: { oldKey: config.id, newKey }
            });
          }

          config.id = newKey;
          cache = await axios.storage.get(newKey, config);
        }
      }
    }

    // Not cached, continue the request, and mark it as fetching
    // biome-ignore lint/suspicious/noConfusingLabels: required to break condition in simultaneous accesses
    ignoreAndRequest: if (
      cache.state === 'empty' ||
      cache.state === 'stale' ||
      cache.state === 'must-revalidate' ||
      overrideCache
    ) {
      // This checks for simultaneous access to a new key. The js event loop jumps on the
      // first await statement, so the second (asynchronous call) request may have already
      // started executing.
      if (axios.waiting.has(config.id) && !overrideCache) {
        cache = await axios.storage.get(config.id, config);

        // This check is required when a request has it own cache deleted manually, lets
        // say by a `axios.storage.delete(key)` and has a concurrent loading request.
        // Because in this case, the cache will be empty and may still has a pending key
        // on waiting map.
        if (cache.state !== 'empty' && cache.state !== 'must-revalidate') {
          if (__ACI_DEV__) {
            axios.debug({
              id: config.id,
              msg: 'Concurrent request found, reusing result'
            });
          }

          break ignoreAndRequest;
        }
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      const def = deferred<void>();
      axios.waiting.set(config.id, def);

      // Adds a default reject handler to catch when the request gets aborted without
      // others waiting for it.
      def.catch(() => undefined);

      await axios.storage.set(
        config.id,
        {
          state: 'loading',
          previous: overrideCache
            ? // Simply determine if the request is stale or not
              // based if it had previous data or not
              cache.data
              ? 'stale'
              : 'empty'
            : // Typescript doesn't know that cache.state here can only be 'empty' or 'stale'
              (cache.state as 'stale' | 'must-revalidate'),

          data: cache.data as any,

          // If the cache is empty and asked to override it, use the current timestamp
          createdAt: overrideCache && !cache.createdAt ? Date.now() : (cache.createdAt as any)
        },
        config
      );

      // Skip adding conditional headers (If-None-Match, If-Modified-Since) when override is true.
      // The override option is meant to bypass cache and get fresh data, not revalidate existing cache.
      // Adding conditional headers would cause the server to return 304 Not Modified instead of fresh data.
      if ((cache.state === 'stale' || cache.state === 'must-revalidate') && !overrideCache) {
        updateStaleRequest(cache, config as ConfigWithCache<unknown>);

        if (__ACI_DEV__) {
          axios.debug({
            id: config.id,
            msg: 'Stale revalidation: added conditional headers (If-None-Match/If-Modified-Since)'
          });
        }
      }

      config.validateStatus = createValidateStatus(config.validateStatus);

      if (__ACI_DEV__) {
        axios.debug({
          id: config.id,
          msg: 'Making network request',
          data: { overrideCache, cacheState: cache.state }
        });
      }

      // Hydrates any UI temporarily, if cache is available
      if (cache.state === 'stale' || (cache.data && cache.state !== 'must-revalidate')) {
        await config.cache.hydrate?.(cache);
      }

      return config;
    }

    let cachedResponse: CachedResponse;

    if (cache.state === 'loading') {
      const deferred = axios.waiting.get(config.id);

      // The deferred may not exists when the process is using a persistent
      // storage and cancelled  in the middle of a request, this would result in
      // a pending loading state in the storage but no current promises to resolve
      if (!deferred) {
        // Hydrates any UI temporarily, if cache is available
        if (cache.data) {
          await config.cache.hydrate?.(cache);
        }

        return config;
      }

      if (__ACI_DEV__) {
        axios.debug({
          id: config.id,
          msg: 'Concurrent request detected, waiting...'
        });
      }

      try {
        // Deferred can't reuse the value because the user's storage might clone
        // or mutate the value, so we need to ask it again.
        // For example with memoryStorage + cloneData
        await deferred;
        const state = await axios.storage.get(config.id, config);

        // This is a cache mismatch and should never happen, but in case it does,
        // we need to redo the request all over again.
        /* c8 ignore start */
        if (!state.data) {
          if (__ACI_DEV__) {
            axios.debug({
              id: config.id,
              msg: 'Concurrent request completed without data, retrying'
            });
          }

          return onFulfilled!(config);
        }
        /* c8 ignore end */

        // After waiting, check if this request's vary headers match the cached variant
        // If mismatch, don't use the cache - make own request to prevent cache poisoning
        if (
          config.cache.vary !== false &&
          state.data.meta?.vary &&
          state.data.headers[Header.Vary]
        ) {
          const vary = Array.isArray(config.cache.vary)
            ? config.cache.vary
            : parseVary(state.data.headers[Header.Vary]);

          // Compare vary headers - if mismatch, make own request
          if (vary && vary !== '*' && !compareVary(vary, state.data.meta.vary, config.headers)) {
            if (__ACI_DEV__) {
              axios.debug({
                id: config.id,
                msg: 'Vary mismatch after concurrent request, making own request',
                data: {
                  cachedVary: state.data.meta.vary,
                  currentVary: extractHeaders(config.headers, vary)
                }
              });
            }

            // Don't use cached response - rerun interceptor logic but with new key
            return onFulfilled!(config);
          }
        }

        cachedResponse = state.data;
      } catch (err) {
        // The deferred was rejected by the first request that encountered an error.
        // All deduplicated requests waiting on this deferred should fail with the same error
        // to maintain consistency and prevent multiple network retries for the same resource.
        if (__ACI_DEV__) {
          axios.debug({
            id: config.id,
            msg: 'Concurrent request failed, propagating error',
            data: err
          });
        }

        throw err;
      }
    } else {
      cachedResponse = cache.data;
    }

    // The cached data is already transformed after receiving the response from the server.
    // Reapplying the transformation on the transformed data will have an unintended effect.
    // Since the cached data is already in the desired format, there is no need to apply the transformation function again.
    config.transformResponse = undefined;

    // Even though the response interceptor receives this one from here,
    // it has been configured to ignore cached responses = true
    config.adapter = function cachedAdapter(): Promise<CacheAxiosResponse> {
      return Promise.resolve({
        config,
        data: cachedResponse.data,
        headers: cachedResponse.headers,
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        cached: true,
        stale: (cache as LoadingStorageValue).previous === 'stale',
        id: config.id!
      });
    };

    if (__ACI_DEV__) {
      axios.debug({
        id: config.id,
        msg: 'Using cached response'
      });
    }

    return config;
  };

  return {
    onFulfilled
  };
}
