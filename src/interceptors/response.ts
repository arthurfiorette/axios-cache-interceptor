import type { AxiosResponse } from 'axios';
import { extract } from 'typed-core/dist/core/object';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheProperties
} from '../axios/types';
import type { CachedStorageValue } from '../storage/types';
import { checkPredicateObject } from '../util/cache-predicate';
import { updateCache } from '../util/update-cache';
import type { AxiosInterceptor } from './types';

export class CacheResponseInterceptor<R>
  implements AxiosInterceptor<CacheAxiosResponse<R>>
{
  constructor(readonly axios: AxiosCacheInstance) {}

  use = (): void => {
    this.axios.interceptors.response.use(this.onFulfilled);
  };

  private testCachePredicate = <R>(
    response: AxiosResponse<R>,
    cache?: Partial<CacheProperties>
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

  onFulfilled = async (
    axiosResponse: AxiosResponse<R>
  ): Promise<CacheAxiosResponse<R>> => {
    const key = this.axios.generateKey(axiosResponse.config);

    const response: CacheAxiosResponse<R> = {
      id: key,
      // When the request interceptor override the request adapter, it means
      // that the response.cached will be true and therefore, the request was cached.
      cached: (axiosResponse as CacheAxiosResponse<R>).cached || false,
      ...axiosResponse
    };

    // Skip cache
    if (response.config.cache === false) {
      return { ...response, cached: false };
    }

    // Response was marked as cached
    if (response.cached) {
      return response;
    }

    const cache = await this.axios.storage.get(key);

    /**
     * From now on, the cache and response represents the state of the
     * first response to a request, which has not yet been cached or
     * processed before.
     */
    if (cache.state !== 'loading') {
      return response;
    }

    // Config told that this response should be cached.
    if (!this.testCachePredicate(response, response.config.cache)) {
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
      state: 'cached',
      ttl: ttl,
      createdAt: Date.now(),
      data: extract(response, ['data', 'headers', 'status', 'statusText'])
    };

    // Update other entries before updating himself
    if (response.config.cache?.update) {
      updateCache(this.axios.storage, response.data, response.config.cache.update);
    }

    const deferred = this.axios.waiting[key];

    // Resolve all other requests waiting for this response
    await deferred?.resolve(newCache.data);
    delete this.axios.waiting[key];

    // Define this key as cache on the storage
    await this.axios.storage.set(key, newCache);

    // Return the response with cached as false, because it was not cached at all
    return response;
  };
}
