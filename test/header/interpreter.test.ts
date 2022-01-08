import { defaultHeaderInterpreter } from '../../src/header/interpreter';
import { Header } from '../../src/util/headers';

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

  it('tests with immutable', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'immutable'
    });

    // 1 year
    expect(result).toBe(1000 * 60 * 60 * 24 * 365);
  });
});
