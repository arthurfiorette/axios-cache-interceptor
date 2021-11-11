import { defaultHeaderInterpreter } from '../../src/header/interpreter';
import { Header } from '../../src/util/headers';

describe('tests header interpreter', () => {
  it('tests without cache-control header', () => {
    const noHeader = defaultHeaderInterpreter();
    expect(noHeader).toBeUndefined();

    const emptyHeader = defaultHeaderInterpreter({ [Header.CacheControl]: '' });
    expect(emptyHeader).toBeUndefined();
  });

  it('tests with cache preventing headers', () => {
    const noStore = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-store'
    });

    expect(noStore).toBe(false);

    const noCache = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-cache'
    });

    expect(noCache).toBe(false);

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

  it('tests with maxAge=10 and age=7 headers', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Age]: '3'
    });

    expect(result).toBe(7 * 1000);
  });

  it('tests with expires and cache-control present', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10',
      [Header.Expires]: new Date(new Date().getFullYear() + 1, 1, 1).toUTCString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with past expires', () => {
    const result = defaultHeaderInterpreter({
      [Header.Expires]: new Date(new Date().getFullYear() - 1, 1, 1).toUTCString()
    });

    // Past means cache invalid
    expect(result).toBe(false);
  });

  it('tests with immutable', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'immutable'
    });

    // 1 year
    expect(result).toBe(1000 * 60 * 60 * 24 * 365);
  });

  it('tests with future expires', () => {
    const date = new Date(new Date().getFullYear() + 1, 1, 1);

    const result = defaultHeaderInterpreter({
      [Header.Expires]: date.toUTCString()
    });

    const approx = date.getTime() - Date.now();

    expect(typeof result).toBe('number');
    // the result should be what the date is in milliseconds
    // minus the actual epoch milliseconds
    expect(Math.abs((result as number) - approx)).toBeLessThan(1);
  });
});
