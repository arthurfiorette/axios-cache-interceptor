import type { AxiosCacheInstance, CacheRequestConfig } from '../axios/types';
import type {
  CachedResponse,
  CachedStorageValue,
  LoadingStorageValue
} from '../storage/types';
import { deferred } from '../util/deferred';
import { CACHED_STATUS_CODE, CACHED_STATUS_TEXT } from '../util/status-codes';
import type { AxiosInterceptor } from './types';

export class CacheRequestInterceptor implements AxiosInterceptor<CacheRequestConfig> {
  constructor(readonly axios: AxiosCacheInstance) {}

  use = (): void => {
    this.axios.interceptors.request.use(this.onFulfilled);
  };

  onFulfilled = async (config: CacheRequestConfig): Promise<CacheRequestConfig> => {
    // Skip cache
    if (config.cache === false) {
      return config;
    }

    // Only cache specified methods
    const allowedMethods = config.cache?.methods || this.axios.defaults.cache.methods;

    if (
      !allowedMethods.some((method) => (config.method || 'get').toLowerCase() == method)
    ) {
      return config;
    }

    const key = this.axios.generateKey(config);

    // Assumes that the storage handled staled responses
    let cache = await this.axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    emptyState: if (cache.state == 'empty') {
      /**
       * This checks for simultaneous access to a new key. The js
       * event loop jumps on the first await statement, so the second
       * (asynchronous call) request may have already started executing.
       */
      if (this.axios.waiting[key]) {
        cache = (await this.axios.storage.get(key)) as
          | CachedStorageValue
          | LoadingStorageValue;
        break emptyState;
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      this.axios.waiting[key] = deferred();

      /**
       * Add a default reject handler to detect when the request is
       * aborted without others waiting
       */
      this.axios.waiting[key]?.catch(() => {});

      await this.axios.storage.set(key, {
        state: 'loading',
        ttl: config.cache?.ttl
      });

      return config;
    }

    let data: CachedResponse = {};

    if (cache.state === 'loading') {
      const deferred = this.axios.waiting[key];

      /**
       * If the deferred is undefined, means that the outside has
       * removed that key from the waiting list
       */
      if (!deferred) {
        await this.axios.storage.remove(key);
        return config;
      }

      try {
        data = await deferred;
      } catch (e) {
        // The deferred is rejected when the request that we are waiting rejected cache.
        return config;
      }
    } else {
      data = cache.data;
    }

    config.adapter = () =>
      Promise.resolve({
        config,
        data: data.body,
        headers: data.headers,
        status: CACHED_STATUS_CODE,
        statusText: CACHED_STATUS_TEXT
      });

    return config;
  };
}
