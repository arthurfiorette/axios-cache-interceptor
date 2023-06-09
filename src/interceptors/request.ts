import { deferred } from 'fast-defer';
import type { AxiosCacheInstance, CacheAxiosResponse } from '../cache/axios';
import { Header } from '../header/headers';
import type {
  CachedResponse,
  CachedStorageValue,
  LoadingStorageValue
} from '../storage/types';
import type { RequestInterceptor } from './build';
import {
  ConfigWithCache,
  createValidateStatus,
  isMethodIn,
  updateStaleRequest
} from './util';

export function defaultRequestInterceptor(axios: AxiosCacheInstance) {
  const onFulfilled: RequestInterceptor['onFulfilled'] = async (config) => {
    const id = (config.id = axios.generateKey(config));

    if (config.cache === false) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Ignoring cache because config.cache === false',
          data: config
        });
      }

      return config;
    }

    // merge defaults with per request configuration
    config.cache = { ...axios.defaults.cache, ...config.cache };

    // Applies sufficient headers to prevent other cache systems to work along with this one
    //
    // Its currently used before isMethodIn because if the isMethodIn returns false, the request
    // shouldn't be cached an therefore neither in the browser.
    if (config.cache.cacheTakeover) {
      config.headers[Header.CacheControl] ??= 'no-cache';
      config.headers[Header.Pragma] ??= 'no-cache';
      config.headers[Header.Expires] ??= '0';
    }

    if (!isMethodIn(config.method, config.cache.methods)) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: `Ignored because method (${config.method}) is not in cache.methods (${config.cache.methods})`
        });
      }

      return config;
    }

    // Assumes that the storage handled staled responses
    let cache = await axios.storage.get(id, config);
    const overrideCache = config.cache.override;

    // Not cached, continue the request, and mark it as fetching
    ignoreAndRequest: if (
      cache.state === 'empty' ||
      cache.state === 'stale' ||
      overrideCache
    ) {
      /**
       * This checks for simultaneous access to a new key. The js event loop jumps on the
       * first await statement, so the second (asynchronous call) request may have already
       * started executing.
       */
      if (axios.waiting[id] && !overrideCache) {
        cache = (await axios.storage.get(id, config)) as
          | CachedStorageValue
          | LoadingStorageValue;

        /**
         * This check is required when a request has it own cache deleted manually, lets
         * say by a `axios.storage.delete(key)` and has a concurrent loading request.
         * Because in this case, the cache will be empty and may still has a pending key
         * on waiting map.
         */
        //@ts-expect-error read above
        if (cache.state !== 'empty') {
          if (__ACI_DEV__) {
            axios.debug?.({
              id,
              msg: 'Waiting list had an deferred for this key, waiting for it to finish'
            });
          }

          break ignoreAndRequest;
        }
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      axios.waiting[id] = deferred();

      /**
       * Adds a default reject handler to catch when the request gets aborted without
       * others waiting for it.
       */
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      axios.waiting[id]!.catch(() => undefined);

      await axios.storage.set(
        id,
        {
          state: 'loading',
          previous: overrideCache
            ? // Simply determine if the request is stale or not
              // based if it had previous data or not
              cache.data
              ? 'stale'
              : 'empty'
            : // Typescript doesn't know that cache.state here can only be 'empty' or 'stale'
              (cache.state as 'stale'),

          // Eslint complains a lot :)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          data: cache.data as any,

          // If the cache is empty and asked to override it, use the current timestamp
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          createdAt:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            overrideCache && !cache.createdAt ? Date.now() : (cache.createdAt as any)
        },
        config
      );

      if (cache.state === 'stale') {
        updateStaleRequest(cache, config as ConfigWithCache<unknown>);

        if (__ACI_DEV__) {
          axios.debug?.({
            id,
            msg: 'Updated stale request'
          });
        }
      }

      config.validateStatus = createValidateStatus(config.validateStatus);

      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Sending request, waiting for response',
          data: {
            overrideCache,
            state: cache.state
          }
        });
      }

      // Hydrates any UI temporarily, if cache is available
      if (cache.state === 'stale' || cache.data) {
        await config.cache.hydrate?.(cache);
      }

      return config;
    }

    let cachedResponse: CachedResponse;

    if (cache.state === 'loading') {
      const deferred = axios.waiting[id];

      // Just in case, the deferred doesn't exists.
      /* istanbul ignore if 'really hard to test' */
      if (!deferred) {
        await axios.storage.remove(id, config);

        // Hydrates any UI temporarily, if cache is available
        if (cache.data) {
          await config.cache.hydrate?.(cache);
        }

        return config;
      }

      if (__ACI_DEV__) {
        axios.debug?.({
          id,
          msg: 'Detected concurrent request, waiting for it to finish'
        });
      }

      try {
        cachedResponse = await deferred;
      } catch (err) {
        if (__ACI_DEV__) {
          axios.debug?.({
            id,
            msg: 'Deferred rejected, requesting again',
            data: err
          });
        }

        // Hydrates any UI temporarily, if cache is available
        /* istanbul ignore if 'really hard to test' */
        if (cache.data) {
          await config.cache.hydrate?.(cache);
        }

        // The deferred is rejected when the request that we are waiting rejected cache.
        return config;
      }
    } else {
      cachedResponse = cache.data;
    }

    // Even though the response interceptor receives this one from here,
    // it has been configured to ignore cached responses = true
    config.adapter = (): Promise<CacheAxiosResponse> =>
      Promise.resolve({
        config,
        data: cachedResponse.data,
        headers: cachedResponse.headers,
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        cached: true,
        id
      });

    if (__ACI_DEV__) {
      axios.debug?.({
        id,
        msg: 'Returning cached response'
      });
    }

    return config;
  };

  return {
    onFulfilled,
    apply: () => axios.interceptors.request.use(onFulfilled)
  };
}
