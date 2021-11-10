import { defaultHeaderInterpreter } from '../../src/header/interpreter';

describe('tests header interpreter', () => {
  it('tests without cache-control header', () => {
    const noHeader = defaultHeaderInterpreter({});
    expect(noHeader).toBeUndefined();

    const emptyHeader = defaultHeaderInterpreter({ 'cache-control': 'public' });
    expect(emptyHeader).toBeUndefined();
  });

  it('tests with cache preventing headers', () => {
    const noStore = defaultHeaderInterpreter({
      'cache-control': 'no-store'
    });

    expect(noStore).toBe(false);

    const noCache = defaultHeaderInterpreter({
      'cache-control': 'no-cache'
    });

    expect(noCache).toBe(false);
  });

  it('tests with must revalidate headers',() => {
    const mustRevalidate = defaultHeaderInterpreter({
      'cache-control': 'must-revalidate'
    });

    expect(mustRevalidate).toBe(1); // ttl set to 1ms, enabling cache with revalidation
  })

  it('tests with maxAge header for 10 seconds', () => {
    const result = defaultHeaderInterpreter({
      'cache-control': 'max-age=10'
    });

    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with expires and cache-control present', () => {
    const result = defaultHeaderInterpreter({
      'cache-control': 'max-age=10',
      expires: new Date(new Date().getFullYear() + 1, 1, 1).toISOString()
    });

    // expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with past expires', () => {
    const result = defaultHeaderInterpreter({
      expires: new Date(new Date().getFullYear() - 1, 1, 1).toISOString()
    });

    // Past means cache invalid
    expect(result).toBe(false);
  });

  it('tests with future expires', () => {
    const date = new Date(new Date().getFullYear() + 1, 1, 1);

    const result = defaultHeaderInterpreter({
      expires: date.toISOString()
    });

    const approx = date.getTime() - Date.now();

    expect(typeof result).toBe('number');
    // the result should be what the date is in milliseconds
    // minus the actual epoch milliseconds
    expect(Math.abs((result as number) - approx)).toBeLessThan(1);
  });
});
