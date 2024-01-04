import { mock } from 'node:test';
import { AxiosHeaders } from 'axios';
import type { CacheAxiosResponse } from '../src/cache/axios.js';

export const EMPTY_RESPONSE = Object.freeze({
  headers: {},
  status: 200,
  statusText: '200 OK',
  data: true
});

export function createResponse<R>(config: Partial<CacheAxiosResponse<R>>): CacheAxiosResponse {
  return {
    ...EMPTY_RESPONSE,
    config: { headers: new AxiosHeaders() },
    data: {} as R,
    request: {},
    id: 'empty-id',
    cached: true,
    ...config
  };
}

/**
 * Mocks the result of Date.now() to return a current date plus the given ticks.
 *
 * TODO: Migrate to nodejs Date mock timers as soon as possible.
 *
 * @link https://github.com/nodejs/node/pull/48638
 */
export function mockDateNow(ticks: number) {
  const old = Date.now;

  mock.method(Date, 'now', mockedDateNow);

  function mockedDateNow(this: DateConstructor) {
    return old.call(this) + ticks;
  }
}
