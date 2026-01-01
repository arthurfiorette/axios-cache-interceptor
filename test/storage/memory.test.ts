import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers.js';
import { buildMemoryStorage } from '../../src/storage/memory.js';
import type { CachedStorageValue } from '../../src/storage/types.js';
import { EMPTY_RESPONSE, mockDateNow } from '../utils.js';
import { testStorage } from './storages.js';

describe('MemoryStorage', () => {
  testStorage('MemoryStorage', buildMemoryStorage());

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

    assert.notEqual(result, null);
    assert.equal(result.state, 'cached');
    assert.equal(result.data.data, 'data');

    // Deletes the value
    result.data.data = undefined;

    // Check if the value has been modified
    const result2 = await storage.get('key');

    assert.notEqual(result2, null);
    assert.equal(result2.state, 'cached');
    assert.equal(result2.data?.data, 'data');
  });

  // Expects that a when value saved using storage.set() is has his inner properties updated,
  // a request to storage.get() should return unmodified value.
  //
  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/580
  it('ensures set() also clones data when cloneData is double', async () => {
    const storage = buildMemoryStorage('double');

    const data = { ...EMPTY_RESPONSE, data: 'data' };

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: data
    });

    data.data = 'another data';

    assert.notEqual(storage.data.get('key'), null);
    assert.equal(storage.data.get('key')!.state, 'cached');
    assert.notEqual(storage.data.get('key')!.data, null);
    assert.equal(storage.data.get('key')!.data!.data, 'data');

    const result = (await storage.get('key')) as CachedStorageValue;

    assert.notEqual(result, null);
    assert.equal(result.state, 'cached');
    assert.equal(result.data.data, 'data');
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
    assert.equal(storage.data.get('empty')?.state, 'empty');
    assert.equal(storage.data.get('stale')?.state, 'stale');
    assert.equal(storage.data.get('expiredStale')?.state, 'stale');
    assert.equal(storage.data.get('loading')?.state, 'loading');
    assert.equal(storage.data.get('cached')?.state, 'cached');
    assert.equal(storage.data.get('expiredCache')?.state, 'cached');

    // Waits for the cleanup function to run
    await mockDateNow(600);

    assert.equal((await storage.get('empty')).state, 'empty');
    assert.equal((await storage.get('stale')).state, 'stale');
    assert.equal((await storage.get('expiredStale')).state, 'empty');
    assert.equal((await storage.get('loading')).state, 'loading');
    assert.equal((await storage.get('cached')).state, 'cached');
    assert.equal((await storage.get('expiredCache')).state, 'empty');

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

    assert.equal(storage.data.size, 2);
    assert.ok(storage.data.get('key'));
    assert.ok(storage.data.get('key2'));
    assert.equal(storage.data.get('key3'), undefined);

    await storage.set('key3', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    assert.equal(storage.data.size, 2);

    assert.equal(storage.data.get('key'), undefined);
    assert.ok(storage.data.get('key2'));
    assert.ok(storage.data.get('key3'));
  });

  it('migrates old x-axios-cache headers to meta.revalidation', async () => {
    const storage = buildMemoryStorage();

    // Create old-format cache entry with x-axios-cache headers
    await storage.set('old-etag', {
      state: 'stale',
      ttl: 5000,
      createdAt: Date.now(),
      data: {
        status: 200,
        statusText: 'OK',
        headers: { [Header.XAxiosCacheEtag]: 'W/old-etag-value' }
      }
    });

    await storage.set('old-lastmodified', {
      state: 'stale',
      ttl: 5000,
      createdAt: Date.now(),
      data: {
        status: 200,
        statusText: 'OK',
        headers: { [Header.XAxiosCacheLastModified]: 'use-cache-timestamp' }
      }
    });

    await storage.set('old-both', {
      state: 'stale',
      ttl: 5000,
      createdAt: Date.now(),
      data: {
        status: 200,
        statusText: 'OK',
        headers: {
          [Header.XAxiosCacheEtag]: 'W/combined-value',
          [Header.XAxiosCacheLastModified]: 'Wed, 21 Oct 2015 07:28:00 GMT',
          [Header.XAxiosCacheStaleIfError]: '3600'
        }
      }
    });

    // Access entries to trigger migration
    const etag = await storage.get('old-etag');
    const lastmod = await storage.get('old-lastmodified');
    const both = await storage.get('old-both');

    // Verify etag migration
    assert.equal(etag.state, 'stale');
    assert.equal(etag.data?.meta?.revalidation?.etag, 'W/old-etag-value');
    assert.equal(etag.data?.headers[Header.XAxiosCacheEtag], undefined);

    // Verify lastModified migration (string -> true conversion)
    assert.equal(lastmod.state, 'stale');
    assert.equal(lastmod.data?.meta?.revalidation?.lastModified, true);
    assert.equal(lastmod.data?.headers[Header.XAxiosCacheLastModified], undefined);

    // Verify combined migration
    assert.equal(both.state, 'stale');
    assert.equal(both.data?.meta?.revalidation?.etag, 'W/combined-value');
    assert.equal(both.data?.meta?.revalidation?.lastModified, 'Wed, 21 Oct 2015 07:28:00 GMT');
    assert.equal(both.data?.headers[Header.XAxiosCacheEtag], undefined);
    assert.equal(both.data?.headers[Header.XAxiosCacheLastModified], undefined);
    assert.equal(both.data?.headers[Header.XAxiosCacheStaleIfError], undefined);
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

    assert.equal(storage.data.size, 3);
    assert.ok(storage.data.get('exp'));
    assert.ok(storage.data.get('not exp'));
    assert.ok(storage.data.get('exp2'));
    assert.equal(storage.data.get('key'), undefined);

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    assert.equal(storage.data.size, 2);

    assert.equal(storage.data.get('exp'), undefined);
    assert.equal(storage.data.get('exp2'), undefined);
    assert.ok(storage.data.get('not exp'));
    assert.ok(storage.data.get('key'));
  });
});
