import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';
import { mockAxios } from '../mocks/axios';

describe('tests header interpreter', () => {
  it('tests without cache-control header', () => {
    expect(defaultHeaderInterpreter()).toBe('not enough headers');

    expect(defaultHeaderInterpreter({})).toBe('not enough headers');

    expect(defaultHeaderInterpreter({ [Header.CacheControl]: '' })).toBe(
      'not enough headers'
    );

    expect(defaultHeaderInterpreter({ ['x-random-header']: '' })).toBe(
      'not enough headers'
    );
  });

  it('tests with maxAge=10 and age=3 headers', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Age]: '3'
    });

    expect(result).toEqual({ cache: 7 * 1000, stale: undefined });
  });

  it('tests with expires and cache-control present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toEqual({ cache: 10 * 1000, stale: undefined });
  });

  it('tests with immutable', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'immutable'
    });

    // 1 year
    expect(result).toEqual({ cache: 1000 * 60 * 60 * 24 * 365 });
  });

  it('tests with maxAge=10 and age=3 and staleWhileRevalidate headers', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Age]: '3'
    });

    expect(result).toEqual({ cache: 7 * 1000, stale: 5 * 1000 });
  });

  it('tests with expires and cache-control and staleWhileRevalidate present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toEqual({ cache: 10 * 1000, stale: 5 * 1000 });
  });

  it('tests header interpreter integration returning only numbers', async () => {
    const axios = mockAxios({ headerInterpreter: () => 100 }, {});

    // Make first request to cache it
    await axios.get('http://test.com', { cache: { interpretHeader: true } });
    const result = await axios.get('http://test.com');

    expect(result.cached).toBe(true);
  });

  it('tests header interpreter stale with staleWhileRevalidate and maxStale', () => {
    // only staleWhileRevalidate
    expect(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5'
      })
    ).toEqual({ cache: 10 * 1000, stale: 5 * 1000 });

    // only maxStale
    expect(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10, max-stale=4'
      })
    ).toEqual({ cache: 10 * 1000, stale: 4 * 1000 });

    // both should use max-stale
    expect(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5, max-stale=4'
      })
    ).toEqual({ cache: 10 * 1000, stale: 4 * 1000 });

    // none should return undefined
    expect(
      defaultHeaderInterpreter({
        [Header.CacheControl]: 'max-age=10'
      })
    ).toEqual({ cache: 10 * 1000, stale: undefined });
  });
});
