import { deferred } from 'fast-defer';
import type { AxiosCacheInstance, CacheAxiosResponse } from '../cache/axios';
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
    if (config.cache === false) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: 'Ignoring cache because config.cache is false',
          data: config
        });
      }

      return config;
    }

    // merge defaults with per request configuration
    config.cache = { ...axios.defaults.cache, ...config.cache };

    if (!isMethodIn(config.method, config.cache.methods)) {
      if (__ACI_DEV__) {
        axios.debug?.({
          msg: `Ignored because method (${config.method}) is not in cache.methods (${config.cache.methods})`
        });
      }
      return config;
    }

    const key = (config.id = axios.generateKey(config));

    // Assumes that the storage handled staled responses
    let cache = await axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    emptyOrStale: if (cache.state === 'empty' || cache.state === 'stale') {
      /**
       * This checks for simultaneous access to a new key. The js event loop jumps on the
       * first await statement, so the second (asynchronous call) request may have already
       * started executing.
       */
      if (axios.waiting[key]) {
        cache = (await axios.storage.get(key)) as
          | CachedStorageValue
          | LoadingStorageValue;

        if (__ACI_DEV__) {
          axios.debug?.({
            id: key,
            msg: 'Waiting list had an deferred for this key, waiting for it to finish'
          });
        }

        break emptyOrStale;
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      axios.waiting[key] = deferred();

      /**
       * Add a default reject handler to catch when the request is aborted without others
       * waiting for it.
       */
      axios.waiting[key]?.catch(() => undefined);

      await axios.storage.set(key, {
        state: 'loading',
        previous: cache.state,

        // Eslint complains a lot :)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        data: cache.data as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        createdAt: cache.createdAt as any
      });

      if (cache.state === 'stale') {
        updateStaleRequest(cache, config as ConfigWithCache<unknown>);

        if (__ACI_DEV__) {
          axios.debug?.({
            id: key,
            msg: 'Updated stale request'
          });
        }
      }

      config.validateStatus = createValidateStatus(config.validateStatus);

      if (__ACI_DEV__) {
        axios.debug?.({
          id: key,
          msg: 'Sending request, waiting for response'
        });
      }

      return config;
    }

    let cachedResponse: CachedResponse;

    if (cache.state === 'loading') {
      const deferred = axios.waiting[key];

      // Just in case, the deferred doesn't exists.
      /* istanbul ignore if 'really hard to test' */
      if (!deferred) {
        await axios.storage.remove(key);
        return config;
      }

      if (__ACI_DEV__) {
        axios.debug?.({
          id: key,
          msg: 'Detected concurrent request, waiting for it to finish'
        });
      }

      try {
        cachedResponse = await deferred;
      } catch (err) {
        if (__ACI_DEV__) {
          axios.debug?.({
            id: key,
            msg: 'Deferred rejected, requesting again',
            data: err
          });
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
        id: key
      });

    if (__ACI_DEV__) {
      axios.debug?.({
        id: key,
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
