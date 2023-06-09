import type { CacheAxiosResponse } from '../cache/axios';

/**
 * The possible values are:
 *
 * - `'dont cache'`: the request will not be cached.
 * - `'not enough headers'`: the request will find other ways to determine the TTL value.
 * - `number`: used as the TTL value.
 * - `{ cache: number, stale: number }: used as the TTL value and stale TTL value`
 */
export type InterpreterResult =
  | 'dont cache'
  | 'not enough headers'
  | number
  | {
      cache: number;
      stale?: number;
    };

/**
 * - If activated, when the response is received, the `ttl` property will be inferred from
 *   the requests headers. As described in the MDN docs and HTML specification.
 *
 * The possible returns are:
 *
 * - `'dont cache'`: the request will not be cached.
 * - `'not enough headers'`: the request will find other ways to determine the TTL value.
 * - `number`: used as the TTL value.
 * - `{ cache: number, stale: number }: used as the TTL value and stale TTL value`
 *
 * @param header The header object to interpret.
 * @returns `false` if cache should not be used. `undefined` when provided headers was not
 *   enough to determine a valid value. Or a `number` containing the number of
 *   **milliseconds** to cache the response.
 * @see https://axios-cache-interceptor.js.org/config#headerinterpreter
 */
export type HeaderInterpreter = (
  headers?: CacheAxiosResponse['headers']
) => InterpreterResult;
