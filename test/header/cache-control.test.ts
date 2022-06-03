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

    expect(mustRevalidate).toBe(0);
  });

  it('tests with maxAge header for 10 seconds', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10'
    });

    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with max-age of 0', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=0'
    })

    expect(result).toBe(0);
    expect(result).not.toBe('not enough headers')
  })
});
