import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';

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

    expect(result).toEqual({ cacheTtl: 7 * 1000, staleTtl: 0 });
  });

  it('tests with expires and cache-control present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toEqual({ cacheTtl: 10 * 1000, staleTtl: 0 });
  });

  it('tests with immutable', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'immutable'
    });

    // 1 year
    expect(result).toEqual({ cacheTtl: 1000 * 60 * 60 * 24 * 365 });
  });

  it('tests with maxAge=10 and age=3 and staleWhileRevalidate headers', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10,stale-while-revalidate=5',
      [Header.Age]: '3'
    });

    expect(result).toEqual({ cacheTtl: 7 * 1000, staleTtl: 5 * 1000 });
  });

  it('tests with expires and cache-control and staleWhileRevalidate present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10,stale-while-revalidate=5',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toEqual({ cacheTtl: 10 * 1000, staleTtl: 5 * 1000 });
  });
});
