import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';

describe('Cache-Control HTTP Header', () => {
  it('Cache preventing headers', () => {
    const noStore = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-store'
    });

    assert.equal(noStore, 'dont cache');

    const noCache = defaultHeaderInterpreter({
      [Header.CacheControl]: 'no-cache'
    });

    assert.equal(noCache, 'dont cache');

    const mustRevalidate = defaultHeaderInterpreter({
      [Header.CacheControl]: 'must-revalidate'
    });

    assert.equal(mustRevalidate, 'not enough headers');
  });

  it('MaxAge header for 10 seconds', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10'
    });

    // 10 Seconds in milliseconds
    assert.deepEqual(result, { cache: 10 * 1000, stale: undefined });
  });

  it('MaxAge of 0', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=0'
    });

    assert.deepEqual(result, { cache: 0, stale: undefined });
  });

  it('Stale values with Age', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: 'max-age=10, stale-while-revalidate=5',
      [Header.Age]: '5'
    });

    assert.deepEqual(result, { cache: 5 * 1000, stale: 5 * 1000 });
  });
});
