import type { AxiosResponse } from 'axios';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheProperties,
  CacheRequestConfig
} from '../axios/types';
import type { CachedStorageValue } from '../storage/types';
import { checkPredicateObject } from '../util/cache-predicate';
import { updateCache } from '../util/update-cache';
import type { AxiosInterceptor } from './types';

type CacheConfig = CacheRequestConfig & { cache?: Partial<CacheProperties> };

export class CacheResponseInterceptor implements AxiosInterceptor<CacheAxiosResponse> {
  constructor(readonly axios: AxiosCacheInstance) {}

  use = (): void => {
    this.axios.interceptors.response.use(this.onFulfilled);
  };

  private testCachePredicate = (
    response: AxiosResponse,
    { cache }: CacheConfig
  ): boolean => {
    const cachePredicate =
      cache?.cachePredicate || this.axios.defaults.cache.cachePredicate;

    return (
      (typeof cachePredicate === 'function' && cachePredicate(response)) ||
      (typeof cachePredicate === 'object' &&
        checkPredicateObject(response, cachePredicate))
    );
  };

  /**
   * Rejects cache for this response. Also update the waiting list for
   * this key by rejecting it.
   */
  private rejectResponse = async (key: string) => {
    // Update the cache to empty to prevent infinite loading state
    await this.axios.storage.remove(key);
    // Reject the deferred if present
    this.axios.waiting[key]?.reject();
    delete this.axios.waiting[key];
  };

  onFulfilled = async (response: CacheAxiosResponse): Promise<CacheAxiosResponse> => {
    const key = this.axios.generateKey(response.config);
    response.id = key;

    // Skip cache
    if (response.config.cache === false) {
      return response;
    }

    const cache = await this.axios.storage.get(key);

    // Response shouldn't be cached or was already cached
    if (cache.state !== 'loading') {
      return response;
    }

    // Config told that this response should be cached.
    if (!this.testCachePredicate(response, response.config as CacheConfig)) {
      await this.rejectResponse(key);
      return response;
    }

    let ttl = response.config.cache?.ttl || this.axios.defaults.cache.ttl;

    if (response.config.cache?.interpretHeader) {
      const expirationTime = this.axios.headerInterpreter(response.headers);

      // Cache should not be used
      if (expirationTime === false) {
        await this.rejectResponse(key);
        return response;
      }

      ttl = expirationTime ? expirationTime : ttl;
    }

    const newCache: CachedStorageValue = {
      data: { body: response.data, headers: response.headers },
      state: 'cached',
      ttl: ttl,
      createdAt: Date.now()
    };

    // Update other entries before updating himself
    if (response.config.cache?.update) {
      updateCache(this.axios, response.data, response.config.cache.update);
    }

    const deferred = this.axios.waiting[key];

    // Resolve all other requests waiting for this response
    await deferred?.resolve(newCache.data);
    delete this.axios.waiting[key];

    await this.axios.storage.set(key, newCache);

    return response;
  };
}
