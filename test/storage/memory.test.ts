import { Header } from '../../src/header/headers';
import { buildMemoryStorage } from '../../src/storage/memory';
import type { CachedStorageValue } from '../../src/storage/types';
import { EMPTY_RESPONSE, sleep } from '../utils';
import { testStorage } from './storages';

describe('tests memory storage', () => {
  testStorage('memory', () => buildMemoryStorage());

  // Expects that when a result returned by storage.get() has his inner properties updated,
  // a new request to storage.get() should maintain the same value.
  //
  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/163
  it('not allow changes by value reference', async () => {
    const storage = buildMemoryStorage(true);

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    const result = (await storage.get('key')) as CachedStorageValue;

    expect(result).not.toBeNull();
    expect(result.state).toBe('cached');
    expect(result.data.data).toBe('data');

    // Deletes the value
    delete result.data.data;

    // Check if the value has been modified
    const result2 = await storage.get('key');

    expect(result2).not.toBeNull();
    expect(result2.state).toBe('cached');
    expect(result2.data?.data).toBe('data');
  });

  // Expects that a when value saved using storage.set() is has his inner properties updated,
  // a request to storage.get() should return unmodified value.
  //
  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/580
  it('not allow changes by value reference before', async () => {
    const storage = buildMemoryStorage(false, false, false, true);

    const data = { ...EMPTY_RESPONSE, data: 'data' };
    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: data
    });

    data.data = 'another data';

    const result = (await storage.get('key')) as CachedStorageValue;

    expect(result).not.toBeNull();
    expect(result.state).toBe('cached');
    expect(result.data.data).toBe('data');
  });

  it('tests cleanup function', async () => {
    const storage = buildMemoryStorage(false, 500);

    //@ts-expect-error - this is indeed wrongly behavior
    await storage.set('empty', { state: 'empty' });
    await storage.set('stale', {
      state: 'stale',
      ttl: 1000,
      createdAt: Date.now() - 2000,
      data: {
        status: 200,
        statusText: '200 OK',
        headers: { [Header.XAxiosCacheEtag]: 'ETAG-VALUE' }
      }
    });
    await storage.set('expiredStale', {
      state: 'stale',
      ttl: 1000,
      createdAt: Date.now() - 2000,
      data: {
        status: 200,
        statusText: '200 OK',
        headers: { [Header.XAxiosCacheStaleIfError]: true }
      }
    });
    await storage.set('loading', { previous: 'empty', state: 'loading' });
    await storage.set('cached', {
      data: {
        status: 200,
        statusText: '200 OK',
        headers: {}
      },
      ttl: 5000,
      createdAt: Date.now() - 500,
      state: 'cached'
    });
    await storage.set('expiredCache', {
      data: {
        status: 200,
        statusText: '200 OK',
        headers: {}
      },
      ttl: 1000,
      createdAt: Date.now() - 1500,
      state: 'cached'
    });

    // Ensure that the values are still there
    expect(storage.data['empty']).toMatchObject({ state: 'empty' });
    expect(storage.data['stale']).toMatchObject({ state: 'stale' });
    expect(storage.data['expiredStale']).toMatchObject({ state: 'stale' });
    expect(storage.data['loading']).toMatchObject({ state: 'loading' });
    expect(storage.data['cached']).toMatchObject({ state: 'cached' });
    expect(storage.data['expiredCache']).toMatchObject({
      state: 'cached'
    });

    // Waits for the cleanup function to run
    await sleep(600);

    await expect(storage.get('empty')).resolves.toMatchObject({ state: 'empty' });
    await expect(storage.get('stale')).resolves.toMatchObject({ state: 'stale' });
    await expect(storage.get('expiredStale')).resolves.toMatchObject({ state: 'empty' });
    await expect(storage.get('loading')).resolves.toMatchObject({ state: 'loading' });
    await expect(storage.get('cached')).resolves.toMatchObject({ state: 'cached' });
    await expect(storage.get('expiredCache')).resolves.toMatchObject({ state: 'empty' });

    // Clears handle
    clearTimeout(storage.cleaner);
  });

  it('tests maxEntries without cleanup', async () => {
    const storage = buildMemoryStorage(false, false, 2);

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    await storage.set('key2', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    expect(Object.keys(storage.data)).toHaveLength(2);
    expect(storage.data['key']).toBeDefined();
    expect(storage.data['key2']).toBeDefined();
    expect(storage.data['key3']).toBeUndefined();

    await storage.set('key3', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    expect(Object.keys(storage.data)).toHaveLength(2);

    expect(storage.data['key']).toBeUndefined();
    expect(storage.data['key2']).toBeDefined();
    expect(storage.data['key3']).toBeDefined();
  });

  it('tests maxEntries with cleanup', async () => {
    const storage = buildMemoryStorage(false, false, 3);

    await storage.set('exp', {
      state: 'cached',
      createdAt: Date.now() - 1000,
      ttl: 500,
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    await storage.set('not exp', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    await storage.set('exp2', {
      state: 'cached',
      createdAt: Date.now() - 1000,
      ttl: 500,
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    expect(Object.keys(storage.data)).toHaveLength(3);
    expect(storage.data['exp']).toBeDefined();
    expect(storage.data['not exp']).toBeDefined();
    expect(storage.data['exp2']).toBeDefined();
    expect(storage.data['key']).toBeUndefined();

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    expect(Object.keys(storage.data)).toHaveLength(2);

    expect(storage.data['exp']).toBeUndefined();
    expect(storage.data['exp2']).toBeUndefined();
    expect(storage.data['not exp']).toBeDefined();
    expect(storage.data['key']).toBeDefined();
  });
});
