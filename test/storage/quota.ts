import assert from 'node:assert';
import { it } from 'node:test';
import { buildWebStorage } from '../../src/storage/web-api.js';
import { mockAxios } from '../mocks/axios.js';
import { EMPTY_RESPONSE } from '../utils.js';

const MAXIMUM_LIMIT = 5_000_000;

const MAXIMUM_0 = '0'.repeat(MAXIMUM_LIMIT);
const MAXIMUM_20_0 = '0'.repeat(MAXIMUM_LIMIT * 0.2);
const MAXIMUM_90_0 = '0'.repeat(MAXIMUM_LIMIT * 0.9);

export function testStorageQuota(name: string, storage: Storage): void {
  it(`${name} has storage limit`, () => {
    assert.ok(storage);

    assert.doesNotThrow(() => {
      storage.setItem('key', MAXIMUM_90_0);
    });

    assert.throws(() => {
      storage.setItem('key', MAXIMUM_0);
    });
  });

  it(`buildWebStorage(${name}) function`, () => {
    const webStorage = buildWebStorage(storage);

    assert.equal(typeof webStorage.get, 'function');
    assert.equal(typeof webStorage.set, 'function');
    assert.equal(typeof webStorage.remove, 'function');
  });

  it(`${name} with giant values`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(storage) });

    // Does not throw error
    await axios.storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 60_000,
      data: { ...EMPTY_RESPONSE, data: MAXIMUM_0 }
    });

    // Too big for this storage save
    assert.equal((await axios.storage.get('key')).state, 'empty');
  });

  it(`${name} evicts oldest first`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(storage) });

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
          data: MAXIMUM_20_0 // 20% each
        }
      });
    }

    await axios.storage.set('key-initial', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 60_000,
      data: {
        ...EMPTY_RESPONSE,
        data: MAXIMUM_90_0 // 90%
      }
    });

    const initial = await axios.storage.get('key-initial');

    // Key was defined
    assert.equal(initial.state, 'cached');

    // Has evicted all 1-5 keys
    for (const i of [1, 2, 3, 4]) {
      const { state } = await axios.storage.get(`key-${i}`);
      assert.equal(state, 'empty');
    }
  });

  it(`${name} removes expired keys`, async () => {
    const axios = mockAxios({ storage: buildWebStorage(storage) });

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
          data: MAXIMUM_20_0 // 20% each
        }
      });
    }

    await axios.storage.set('non-expired', {
      state: 'cached',
      createdAt: Date.now(), // today
      ttl: 10_000,
      data: {
        ...EMPTY_RESPONSE,
        data: MAXIMUM_90_0 // 90%
      }
    });

    const initial = await axios.storage.get('non-expired');

    // Key was defined
    assert.equal(initial.state, 'cached');

    // Has evicted all 1-5 keys
    for (const i of [1, 2, 3, 4]) {
      const { state } = await axios.storage.get(`expired-${i}`);
      assert.equal(state, 'empty');
    }
  });
}
