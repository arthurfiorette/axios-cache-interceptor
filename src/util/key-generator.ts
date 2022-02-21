import type { Method } from 'axios';
import { hashCode } from 'object-code';
import type { CacheRequestConfig } from '../cache/axios';
import type { KeyGenerator } from './types';

// Remove first and last '/' char, if present
const SLASHES_REGEX = /^\/|\/$/g;

/**
 * Builds an generator that received the {@link CacheRequestConfig} and should return a
 * string id for it.
 */
export function buildKeyGenerator<R = unknown, D = unknown>(
  hash: false,
  generator: KeyGenerator
): KeyGenerator<R, D>;

/**
 * Builds an generator that received the {@link CacheRequestConfig} and has it's return
 * value hashed by {@link code}.
 *
 * ### You can return an object that is hashed into an unique number, example:
 *
 * ```js
 * // This generator will return a hash code.
 * // The code will only be the same if url, method and data are the same.
 * const generator = buildKeyGenerator(true, ({ url, method, data }) => ({
 *   url,
 *   method,
 *   data
 * }));
 * ```
 */
export function buildKeyGenerator<R = unknown, D = unknown>(
  hash: true,
  generator: (options: CacheRequestConfig<R, D>) => unknown
): KeyGenerator<R, D>;

export function buildKeyGenerator<R = unknown, D = unknown>(
  hash: boolean,
  generator: (options: CacheRequestConfig<R, D>) => unknown
): KeyGenerator<R, D> {
  return (request) => {
    if (request.id) {
      return request.id;
    }

    // Remove trailing slashes
    request.baseURL && (request.baseURL = request.baseURL.replace(SLASHES_REGEX, ''));
    request.url && (request.url = request.url.replace(SLASHES_REGEX, ''));

    // lowercase method
    request.method && (request.method = request.method.toLowerCase() as Method);

    const result = generator(request) as string;
    return hash ? hashCode(result).toString() : result;
  };
}

export const defaultKeyGenerator = buildKeyGenerator(
  true,
  ({ baseURL = '', url = '', method = 'get', params, data }) => {
    return {
      url: baseURL + (baseURL && url ? '/' : '') + url,
      method,
      params: params as unknown,
      data
    };
  }
);
