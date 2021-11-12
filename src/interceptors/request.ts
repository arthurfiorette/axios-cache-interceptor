import type { Method } from 'axios';
import { deferred } from 'typed-core/dist/promises/deferred';
import type { CacheProperties } from '..';
import type {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheRequestConfig
} from '../cache/axios';
import type {
  CachedResponse,
  CachedStorageValue,
  EmptyStorageValue,
  LoadingStorageValue,
  StaleStorageValue
} from '../storage/types';
import { Header } from '../util/headers';
import type { AxiosInterceptor } from './types';

export class CacheRequestInterceptor<D>
  implements AxiosInterceptor<CacheRequestConfig<D>>
{
  constructor(readonly axios: AxiosCacheInstance) {}

  public use = (): void => {
    this.axios.interceptors.request.use(this.onFulfilled);
  };

  public onFulfilled = async (
    config: CacheRequestConfig<D>
  ): Promise<CacheRequestConfig<D>> => {
    if (
      config.cache === false ||
      !this.isMethodAllowed(this.axios, config.method, config.cache)
    ) {
      return config;
    }

    const key = this.axios.generateKey(config);

    // Assumes that the storage handled staled responses
    let cache = await this.axios.storage.get(key);

    // Not cached, continue the request, and mark it as fetching
    emptyOrStale: if (cache.state == 'empty' || cache.state === 'stale') {
      /**
       * This checks for simultaneous access to a new key. The js
       * event loop jumps on the first await statement, so the second
       * (asynchronous call) request may have already started executing.
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
       * Add a default reject handler to catch when the request is
       * aborted without others waiting for it.
       */
      this.axios.waiting[key]?.catch(() => undefined);

      await this.axios.storage.set(key, {
        state: 'loading',
        ttl: config.cache?.ttl,
        data: cache.data
      });

      //@ts-expect-error type infer couldn't resolve this
      this.setRequestHeaders(cache, config);

      const oldValidate = config.validateStatus;
      config.validateStatus = (status: number): boolean => {
        return oldValidate?.(status) || (status >= 200 && status < 300) || status === 304;
      };

      return config;
    }

    let cachedResponse: CachedResponse;

    if (cache.state === 'loading') {
      const deferred = this.axios.waiting[key];

      // Just in case, the deferred doesn't exists.
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

  private isMethodAllowed = (
    axios: AxiosCacheInstance,
    method: Method = 'get',
    properties?: Partial<CacheProperties>
  ): boolean => {
    const requestMethod = method.toLowerCase();
    const allowedMethods = properties?.methods || axios.defaults.cache.methods;

    for (const method of allowedMethods) {
      if (method.toLowerCase() === requestMethod) {
        return true;
      }
    }

    return false;
  };

  private setRequestHeaders = (
    cache: StaleStorageValue | EmptyStorageValue,
    config: CacheRequestConfig<D> & { cache: Partial<CacheProperties> | undefined }
  ) => {
    if (!config.cache) return;
    config.headers ||= {};

    const { etag, modifiedSince } = config.cache;

    if (etag) {
      const etagValue = etag === true ? cache.data?.headers[Header.ETag] : etag;
      if (etagValue) {
        config.headers[Header.IfNoneMatch] = etagValue;
      }
    }

    if (
      modifiedSince &&
      cache.state === 'stale'

      // TODO: See if this only applies to get and head
      // && (!config.method ||
      // config.method.toLowerCase() === 'get' ||
      // config.method.toLowerCase() === 'head')
    ) {
      const modifiedDate =
        modifiedSince === true ? new Date(cache.createdAt) : modifiedSince;

      config.headers[Header.IfModifiedSince] = modifiedDate.toUTCString();
    }
  };
}
