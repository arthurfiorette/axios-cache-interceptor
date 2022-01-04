import { deferred } from 'fast-defer';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';
import type {
  CachedResponse,
  CachedStorageValue,
  LoadingStorageValue
} from '../storage/types';
import type { AxiosInterceptor } from './types';
import {
  ConfigWithCache,
  createValidateStatus,
  isMethodIn,
  setRevalidationHeaders
} from './util';

export class CacheRequestInterceptor
  implements AxiosInterceptor<CacheRequestConfig<unknown, unknown>>
{
  constructor(readonly axios: AxiosCacheInstance) {}

  readonly use = (): void => {
    this.axios.interceptors.request.use(this.onFulfilled);
  };

  readonly onFulfilled = async (
    config: CacheRequestConfig<unknown>
  ): Promise<CacheRequestConfig<unknown>> => {
    if (config.cache === false) {
      return config;
    }

    // merge defaults with per request configuration
    config.cache = { ...this.axios.defaults.cache, ...config.cache };

    if (
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      !isMethodIn(config.method!, config.cache.methods)
    ) {
      return config;
    }

    const key = this.axios.generateKey(config);

    // Assumes that the storage handled staled responses
    let cache = await this.axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    emptyOrStale: if (cache.state == 'empty' || cache.state === 'stale') {
      /**
       * This checks for simultaneous access to a new key. The js event loop jumps on the
       * first await statement, so the second (asynchronous call) request may have already
       * started executing.
       */
      if (this.axios.waiting[key]) {
        cache = (await this.axios.storage.get(key)) as
          | CachedStorageValue
          | LoadingStorageValue;
        break emptyOrStale;
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      this.axios.waiting[key] = deferred();

      /**
       * Add a default reject handler to catch when the request is aborted without others
       * waiting for it.
       */
      this.axios.waiting[key]?.catch(() => undefined);

      await this.axios.storage.set(key, {
        state: 'loading',
        data: cache.data
      });

      if (cache.state === 'stale') {
        setRevalidationHeaders(cache, config as ConfigWithCache<unknown>);
      }

      config.validateStatus = createValidateStatus(config.validateStatus);

      return config;
    }

    let cachedResponse: CachedResponse;

    if (cache.state === 'loading') {
      const deferred = this.axios.waiting[key];

      // Just in case, the deferred doesn't exists.
      /* istanbul ignore if 'really hard to test' */
      if (!deferred) {
        await this.axios.storage.remove(key);
        return config;
      }

      try {
        cachedResponse = await deferred;
      } catch {
        // The deferred is rejected when the request that we are waiting rejected cache.
        return config;
      }
    } else {
      cachedResponse = cache.data;
    }

    config.adapter = () =>
      /**
       * Even though the response interceptor receives this one from here, it has been
       * configured to ignore cached responses: true
       */
      Promise.resolve<CacheAxiosResponse<unknown, unknown>>({
        config,
        data: cachedResponse.data,
        headers: cachedResponse.headers,
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        cached: true,
        id: key
      });

    return config;
  };
}
