import { buildMemoryStorage } from '../../src/storage/memory';
import type { CachedStorageValue } from '../../src/storage/types';
import { EMPTY_RESPONSE } from '../utils';
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
});
