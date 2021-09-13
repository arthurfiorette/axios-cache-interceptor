import { defaultHeaderInterpreter } from '../../src/header';

describe('tests header interpreter', () => {
  it('tests without cache-control header', () => {
    const noHeader = defaultHeaderInterpreter({});
    expect(noHeader).toBeUndefined();

    const emptyHeader = defaultHeaderInterpreter({ 'Cache-Control': 'public' });
    expect(emptyHeader).toBeUndefined();
  });

  it('tests with cache preventing headers', () => {
    const noStore = defaultHeaderInterpreter({
      'Cache-Control': 'no-store'
    });

    expect(noStore).toBe(false);

    const noCache = defaultHeaderInterpreter({
      'Cache-Control': 'no-cache'
    });

    expect(noCache).toBe(false);

    const mustRevalidate = defaultHeaderInterpreter({
      'Cache-Control': 'must-revalidate'
    });

    expect(mustRevalidate).toBe(false);
  });

  it('tests with maxAge header for 10 seconds', () => {
    const result = defaultHeaderInterpreter({
      'Cache-Control': 'max-age=10'
    });

    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with Expires and Cache-Control present', () => {
    const result = defaultHeaderInterpreter({
      'Cache-Control': 'max-age=10',
      Expires: new Date(new Date().getFullYear() + 1, 1, 1).toISOString()
    });

    // Expires should be ignored
    // 10 Seconds in milliseconds
    expect(result).toBe(10 * 1000);
  });

  it('tests with past Expires', () => {
    const result = defaultHeaderInterpreter({
      Expires: new Date(new Date().getFullYear() - 1, 1, 1).toISOString()
    });

    // Past means cache invalid
    expect(result).toBe(false);
  });

  it('tests with future Expires', () => {
    const date = new Date(new Date().getFullYear() + 1, 1, 1);
    const result = defaultHeaderInterpreter({
      Expires: date.toISOString()
    });

    // the result should be what the date is in milliseconds
    // minus the actual epoch milliseconds
    expect(result).toBeCloseTo(date.getTime() - Date.now());
  });
});
