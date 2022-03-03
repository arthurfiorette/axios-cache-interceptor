import type { Method } from 'axios';
import { hash } from 'object-code';
import type { CacheRequestConfig } from '../cache/axios';
import type { KeyGenerator } from './types';

// Remove first and last '/' char, if present
const SLASHES_REGEX = /^\/|\/$/g;

/**
 * Builds an generator that receives a {@link CacheRequestConfig} and returns a value
 * hashed by {@link hash}.
 *
 * The value is hashed into a signed integer when the returned value from the provided
 * generator is not a `string` or a `number`.
 *
 * You can return any type of data structure.
 *
 * @example
 *
 * ```js
 * // This generator will return a hash code.
 * // The code will only be the same if url, method and data are the same.
 * const generator = buildKeyGenerator(({ url, method, data }) => ({
 *   url,
 *   method,
 *   data
 * }));
 * ```
 */
export function buildKeyGenerator<R = unknown, D = unknown>(
  generator: (request: CacheRequestConfig<R, D>) => unknown
): KeyGenerator<R, D> {
  return (request) => {
    if (request.id) {
      return request.id;
    }

    const key = generator(request);

    if (typeof key === 'string' || typeof key === 'number') {
      return `${key}`;
    }

    return `${hash(key)}`;
  };
}

export const defaultKeyGenerator = buildKeyGenerator(
  ({ baseURL = '', url = '', method = 'get', params, data }) => {
    // Remove trailing slashes to avoid generating different keys for the "same" final url.
    baseURL && (baseURL = baseURL.replace(SLASHES_REGEX, ''));
    url && (url = url.replace(SLASHES_REGEX, ''));

    // lowercase method
    method && (method = method.toLowerCase() as Method);

    return {
      url: baseURL + (baseURL && url ? '/' : '') + url,
      params: params as unknown,
      method,
      data
    };
  }
);
