import { deferred } from 'typed-core/dist/promises/deferred';
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

export class CacheRequestInterceptor<D>
  implements AxiosInterceptor<CacheRequestConfig<D>>
{
  constructor(readonly axios: AxiosCacheInstance) {}

  use = (): void => {
    this.axios.interceptors.request.use(this.onFulfilled);
  };

  onFulfilled = async (config: CacheRequestConfig<D>): Promise<CacheRequestConfig<D>> => {
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
    emptyOrStaleState: if (cache.state == 'empty' || cache.state == 'stale') {
      /**
       * This checks for simultaneous access to a new key. The js
       * event loop jumps on the first await statement, so the second
       * (asynchronous call) request may have already started executing.
       */
      if (this.axios.waiting[key]) {
        cache = (await this.axios.storage.get(key)) as
          | CachedStorageValue
          | LoadingStorageValue;
        break emptyOrStaleState;
      }

      // Create a deferred to resolve other requests for the same key when it's completed
      this.axios.waiting[key] = deferred();

      /**
       * Add a default reject handler to catch when the request is
       * aborted without others waiting for it.
       */
      this.axios.waiting[key]?.catch(() => undefined);

      let previousEntry;
      if(cache.state == 'stale'){
        previousEntry = cache.data;
        const {etag, 'last-modified': lastModified} = previousEntry.headers;
        if (etag) {
          config.headers = {...config.headers, 'if-none-match': etag};
        }
        if (lastModified) {
          config.headers = {...config.headers, 'if-modified-since': lastModified};
        }
        if (etag || lastModified) {
          const previousValidateStatus = config.validateStatus;
          config.validateStatus = function (status) {
            return status==304 || !previousValidateStatus || previousValidateStatus(status);
          }
        }
      }

      await this.axios.storage.set(key, {
        state: 'loading',
        ttl: config.cache?.ttl,
        data: previousEntry
      });

      return config;
    }

    let cachedResponse: CachedResponse;

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
        cachedResponse = await deferred;
      } catch (e) {
        // The deferred is rejected when the request that we are waiting rejected cache.
        return config;
      }
    } else {
      cachedResponse = cache.data;
    }

    config.adapter = () =>
      /**
       * Even though the response interceptor receives this one from
       * here, it has been configured to ignore cached responses: true
       */
      Promise.resolve<CacheAxiosResponse<any, D>>({
        config: config,
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
