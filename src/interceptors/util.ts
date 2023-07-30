import type { Method } from 'axios';
import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios';
import type { CacheProperties } from '../cache/cache';
import { Header } from '../header/headers';
import type { CachedResponse, StaleStorageValue } from '../storage/types';

/**
 * Creates a new validateStatus function that will use the one already used and also
 * accept status code 304.
 */
export function createValidateStatus(
  oldValidate?: CacheRequestConfig['validateStatus']
): (status: number) => boolean {
  return oldValidate
    ? (status) => oldValidate(status) || status === 304
    : (status) => (status >= 200 && status < 300) || status === 304;
}

/** Checks if the given method is in the methods array */
export function isMethodIn(
  requestMethod: Method | string = 'get',
  methodList: Method[] = []
): boolean {
  requestMethod = requestMethod.toLowerCase() as Lowercase<Method>;
  return methodList.some((method) => method === requestMethod);
}

export interface ConfigWithCache<D> extends CacheRequestConfig<unknown, D> {
  cache: Partial<CacheProperties<unknown, D>>;
}

/**
 * This function updates the cache when the request is stale. So, the next request to the
 * server will be made with proper header / settings.
 */
export function updateStaleRequest<D>(
  cache: StaleStorageValue,
  config: ConfigWithCache<D>
): void {
  config.headers ||= {};

  const { etag, modifiedSince } = config.cache;

  if (etag) {
    const etagValue =
      etag === true ? (cache.data?.headers[Header.ETag] as unknown) : etag;

    if (etagValue) {
      config.headers[Header.IfNoneMatch] = etagValue;
    }
  }

  if (modifiedSince) {
    config.headers[Header.IfModifiedSince] =
      modifiedSince === true
        ? // If last-modified is not present, use the createdAt timestamp
          (cache.data.headers[Header.LastModified] as unknown) ||
          new Date(cache.createdAt).toUTCString()
        : modifiedSince.toUTCString();
  }
}

/**
 * Creates the new date to the cache by the provided response. Also handles possible 304
 * Not Modified by updating response properties.
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
