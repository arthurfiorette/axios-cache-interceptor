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
  requestMethod: Method = 'get',
  methodList: Method[] = []
): boolean {
  requestMethod = requestMethod.toLowerCase() as Lowercase<Method>;

  for (const method of methodList) {
    if (method.toLowerCase() === requestMethod) {
      return true;
    }
  }

  return false;
}

export type ConfigWithCache<D> = CacheRequestConfig<unknown, D> & {
  cache: Partial<CacheProperties>;
};

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
    const etagValue = etag === true ? cache.data?.headers[Header.ETag] : etag;
    if (etagValue) {
      config.headers[Header.IfNoneMatch] = etagValue;
    }
  }

  if (modifiedSince) {
    config.headers[Header.IfModifiedSince] =
      modifiedSince === true
        ? // If last-modified is not present, use the createdAt timestamp
          cache.data.headers[Header.LastModified] ||
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
  cache?: CachedResponse
): CachedResponse {
  if (response.status === 304 && cache) {
    // Set the cache information into the response object
    response.cached = true;
    response.data = cache.data as R;
    response.status = cache.status;
    response.statusText = cache.statusText;

    // Update possible new headers
    response.headers = {
      ...cache.headers,
      ...response.headers
    };

    // return the old cache
    return cache;
  }

  // New Response
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  };
}
