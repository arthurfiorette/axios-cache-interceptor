import type { Method } from 'axios';
import type {
  CacheAxiosResponse,
  CacheRequestConfig,
  InternalCacheRequestConfig
} from '../cache/axios.js';
import type { CacheProperties } from '../cache/cache.js';
import { Header } from '../header/headers.js';
import type {
  CachedResponse,
  MustRevalidateStorageValue,
  StaleStorageValue
} from '../storage/types.js';

/**
 * Creates a new validateStatus function that will use the one already used and also
 * accept status code 304.
 *
 * @deprecated This function will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export function createValidateStatus(
  oldValidate?: CacheRequestConfig['validateStatus']
): (status: number) => boolean {
  return oldValidate
    ? (status) => oldValidate(status) || status === 304
    : (status) => (status >= 200 && status < 300) || status === 304;
}

/**
 * Checks if the given method is in the methods array
 *
 * @deprecated This function will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export function isMethodIn(
  requestMethod: Method | string = 'get',
  methodList: Method[] = []
): boolean {
  requestMethod = requestMethod.toLowerCase() as Lowercase<Method>;
  return methodList.some((method) => method === requestMethod);
}

/**
 * @deprecated This interface will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export interface ConfigWithCache<D> extends InternalCacheRequestConfig<unknown, D> {
  cache: Partial<CacheProperties<unknown, D>>;
}

/**
 * This function updates the cache when the request is stale. So, the next request to the
 * server will be made with proper header / settings.
 *
 * @deprecated This function will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export function updateStaleRequest<D>(
  cache: StaleStorageValue | MustRevalidateStorageValue,
  config: ConfigWithCache<D>
): void {
  const { etag, modifiedSince } = config.cache;
  const revalidation = cache.data?.meta?.revalidation;

  // Handle ETag revalidation
  if (etag) {
    let etagValue: string | undefined;

    if (revalidation?.etag) {
      // Prefer meta value (new format)
      etagValue = revalidation.etag;
    } else if (etag === true) {
      // Fallback to response ETag header (backward compatibility)
      etagValue = cache.data?.headers[Header.ETag];
    } else {
      // Custom value from config
      etagValue = etag;
    }

    if (etagValue) {
      config.headers.set(Header.IfNoneMatch, etagValue);
    }
  }

  // Handle Last-Modified revalidation
  if (modifiedSince) {
    let lastModifiedValue: string;

    if (revalidation?.lastModified) {
      // Prefer meta value (new format)
      lastModifiedValue =
        revalidation.lastModified === true
          ? new Date(cache.createdAt).toUTCString()
          : revalidation.lastModified;
    } else if (modifiedSince === true) {
      // Fallback to response Last-Modified header (backward compatibility)
      lastModifiedValue =
        cache.data.headers[Header.LastModified] || new Date(cache.createdAt).toUTCString();
    } else {
      // Custom Date from config
      lastModifiedValue = modifiedSince.toUTCString();
    }

    config.headers.set(Header.IfModifiedSince, lastModifiedValue);
  }
}

/**
 * Creates the new date to the cache by the provided response. Also handles possible 304
 * Not Modified by updating response properties.
 *
 * @deprecated This function will be hidden in future versions. Please tell us why you need it at https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158
 */
export function createCacheResponse<R, D>(
  response: CacheAxiosResponse<R, D>,
  previousCache?: CachedResponse
): CachedResponse {
  if (response.status === 304 && previousCache) {
    // Set the cache information into the response object
    response.cached = true;
    response.data = previousCache.data as R;
    response.status = previousCache.status;
    response.statusText = previousCache.statusText;

    // Update possible new headers
    response.headers = {
      ...previousCache.headers,
      ...response.headers
    };

    // return the old cache
    return previousCache;
  }

  // New Response
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  };
}
