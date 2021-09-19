import { AxiosCacheInstance, CacheRequestConfig } from '../axios/types';
import { CachedResponse, CachedStorageValue, LoadingStorageValue } from '../storage/types';
import { Deferred } from '../util/deferred';
import { CACHED_STATUS_CODE, CACHED_STATUS_TEXT } from '../util/status-codes';
import { AxiosInterceptor } from './types';

export class CacheRequestInterceptor implements AxiosInterceptor<CacheRequestConfig> {
  constructor(readonly axios: AxiosCacheInstance) {}

  apply = (): void => {
    this.axios.interceptors.request.use(this.onFulfilled);
  };

  onFulfilled = async (config: CacheRequestConfig): Promise<CacheRequestConfig> => {
    // Ignore caching
    if (config.cache === false) {
      return config;
    }

    // Only cache specified methods
    const allowedMethods = config.cache?.methods || this.axios.defaults.cache.methods;

    if (!allowedMethods.some((method) => (config.method || 'get').toLowerCase() == method)) {
      return config;
    }

    const key = this.axios.generateKey(config);

    // Assumes that the storage handled staled responses
    let cache = await this.axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    emptyState: if (cache.state == 'empty') {
      // This if catches concurrent access to a new key.
      // The js event loop skips in the first await statement,
      // so the next code block will be executed both if called
      // from two places asynchronously.
      if (this.axios.waiting[key]) {
        cache = (await this.axios.storage.get(key)) as CachedStorageValue | LoadingStorageValue;
        break emptyState;
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      this.axios.waiting[key] = new Deferred();

      await this.axios.storage.set(key, {
        state: 'loading',
        ttl: config.cache?.ttl
      });

      return config;
    }

    let data: CachedResponse = {};

    if (cache.state === 'loading') {
      const deferred = this.axios.waiting[key];

      // If the deferred is undefined, means that the
      // outside has removed that key from the waiting list
      if (!deferred) {
        await this.axios.storage.remove(key);
        return config;
      }

      data = await deferred;
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
