import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';

describe('test Cache-Control header', () => {
  it('tests with cache preventing headers', () => {
    const noStore = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-store'
    });

    expect(noStore).toBe('dont cache');

    const noCache = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-cache'
    });

    expect(noCache).toBe('dont cache');

    const mustRevalidate = defaultHeaderInterpreter({
      [Header.CacheControl]: 'must-revalidate'
    });

    expect(mustRevalidate).toEqual('not enough headers');
  });

  it('tests with maxAge header for 10 seconds', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10'
    });

    // 10 Seconds in milliseconds
    expect(result).toEqual({ cache: 10 * 1000, stale: 0 });
  });

  it('tests with max-age of 0', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=0'
    });

    expect(result).toEqual({ cache: 0, stale: 0 });
  });

  it('tests stale values with age', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Age]: '5'
    });

    expect(result).toEqual({ cache: 5 * 1000, stale: 5 * 1000 });
  });
});
