import { buildWebStorage } from '../../src/storage/web-api';
import { mockAxios } from '../mocks/axios';
import { EMPTY_RESPONSE } from '../utils';

export function testStorageQuota(name: string, Storage: () => Storage): void {
  // Jest quota, in browsers this quota can be different but that isn't a problem.
  const MAXIMUM_LIMIT = 5_000_000;

  it(`tests ${name} has storage limit`, () => {
    const storage = Storage();

    expect(storage).toBeDefined();

    expect(() => {
      storage.setItem('key', '0'.repeat(MAXIMUM_LIMIT * 0.9));
    }).not.toThrowError();

    expect(() => {
      storage.setItem('key', '0'.repeat(MAXIMUM_LIMIT));
    }).toThrowError();
  });

  it(`tests buildWebStorage(${name}) function`, () => {
    const webStorage = buildWebStorage(Storage());

    expect(typeof webStorage.get).toBe('function');
    expect(typeof webStorage.set).toBe('function');
    expect(typeof webStorage.remove).toBe('function');
  });

  it(`tests ${name} with gigant values`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(Storage()) });

    // Does not throw error
    await axios.storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 60_000,
      data: { ...EMPTY_RESPONSE, data: '0'.repeat(MAXIMUM_LIMIT) }
    });

    // Too big for this storage save
    expect(await axios.storage.get('key')).toStrictEqual({ state: 'empty' });
  });

  it(`tests ${name} evicts oldest first`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(Storage()) });

    // Fills the storage with 5 keys
    for (const i of [1, 2, 3, 4, 5]) {
      await axios.storage.set(`dummy-${i}`, {
        state: 'loading',
        previous: 'empty'
      });

      await axios.storage.set(`key-${i}`, {
        state: 'cached',
        createdAt: Date.now(),
        ttl: 60_000,
        data: {
          ...EMPTY_RESPONSE,
          data: '0'.repeat(MAXIMUM_LIMIT * 0.2) // 20% each
        }
      });
    }

    await axios.storage.set('key-initial', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 60_000,
      data: {
        ...EMPTY_RESPONSE,
        data: '0'.repeat(MAXIMUM_LIMIT * 0.9) // 90%
      }
    });

    const initial = await axios.storage.get('key-initial');

    // Key was defined
    expect(initial.state).toBe('cached');

    // Has evicted all 1-5 keys
    for (const i of [1, 2, 3, 4]) {
      const { state } = await axios.storage.get(`key-${i}`);
      expect(state).toBe('empty');
    }
  });

  it(`expects ${name} remove expired keys`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(Storage()) });

    const year2k = new Date(2000, 1, 1);

    // Fills the storage with 5 keys
    // Each 10K ms newer than the previous one
    for (const i of [1, 2, 3, 4, 5]) {
      await axios.storage.set(`dummy-${i}`, {
        state: 'loading',
        previous: 'empty'
      });

      await axios.storage.set(`expired-${i}`, {
        state: 'cached',
        createdAt: year2k.getTime(),
        ttl: i * 10_000,
        data: {
          ...EMPTY_RESPONSE,
          data: '0'.repeat(MAXIMUM_LIMIT * 0.2) // 20% each
        }
      });
    }

    await axios.storage.set('non-expired', {
      state: 'cached',
      createdAt: Date.now(), // today
      ttl: 10_000,
      data: {
        ...EMPTY_RESPONSE,
        data: '0'.repeat(MAXIMUM_LIMIT * 0.9) // 90%
      }
    });

    const initial = await axios.storage.get('non-expired');

    // Key was defined
    expect(initial.state).toBe('cached');

    // Has evicted all 1-5 keys
    for (const i of [1, 2, 3, 4]) {
      const { state } = await axios.storage.get(`expired-${i}`);
      expect(state).toBe('empty');
    }
  });
}
