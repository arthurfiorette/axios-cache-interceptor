import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';
import { mockAxios } from '../mocks/axios';

describe('Header Interpreter', () => {
  it('Without CacheControl HTTP Header', () => {
    assert.equal(defaultHeaderInterpreter(), 'not enough headers');

    assert.equal(defaultHeaderInterpreter({}), 'not enough headers');

    assert.equal(
      defaultHeaderInterpreter({ [Header.CacheControl]: '' }),
      'not enough headers'
    );

    assert.equal(
      defaultHeaderInterpreter({ ['x-random-header']: '' }),
      'not enough headers'
    );
  });

  it('MaxAge=10 and Age=3', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Age]: '3'
    });

    assert.deepEqual(result, { cache: 7 * 1000, stale: undefined });
  });

  it('Expires and CacheControl Present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    assert.deepEqual(result, { cache: 10 * 1000, stale: undefined });
  });

  it('Immutable', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'immutable'
    });

    // 1 year
    assert.deepEqual(result, { cache: 1000 * 60 * 60 * 24 * 365 });
  });

  it('MaxAge=10 and Age=3 and StaleWhileRevalidate Headers', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Age]: '3'
    });

    assert.deepEqual(result, { cache: 7 * 1000, stale: 5 * 1000 });
  });

  it('Expires and CacheControl and StaleWhileRevalidate Present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    assert.deepEqual(result, { cache: 10 * 1000, stale: 5 * 1000 });
  });

  it('Integration returning only numbers', async () => {
    const axios = mockAxios({ headerInterpreter: () => 100 }, {});

    // Make first request to cache it
    await axios.get('http://test.com', { cache: { interpretHeader: true } });
    const result = await axios.get('http://test.com');

    assert.ok(result.cached);
  });

  it('Header Interpreter Stale with StaleWhileRevalidate and MaxStale', () => {
    // only staleWhileRevalidate
    assert.deepEqual(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5'
      }),
      { cache: 10 * 1000, stale: 5 * 1000 }
    );

    // only maxStale
    assert.deepEqual(
      defaultHeaderInterpreter({ [Header.CacheControl]: 'max-age=10, max-stale=4' }),
      { cache: 10 * 1000, stale: 4 * 1000 }
    );

    // both should use max-stale
    assert.deepEqual(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5, max-stale=4'
      }),
      { cache: 10 * 1000, stale: 4 * 1000 }
    );

    // none should return undefined
    assert.deepEqual(defaultHeaderInterpreter({ [Header.CacheControl]: 'max-age=10' }), {
      cache: 10 * 1000,
      stale: undefined
    });
  });
});
