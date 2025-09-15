import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import type { CachedStorageValue } from '../../src/storage/types.js';
import { defaultKeyGenerator } from '../../src/util/key-generator.js';
import { mockAxios } from '../mocks/axios.js';

const CACHE_KEY = defaultKeyGenerator({ url: 'https://example.com/' });
const CACHED_VALUE: CachedStorageValue = {
  createdAt: Date.now(),
  state: 'cached',
  ttl: Number.MAX_SAFE_INTEGER, // never expires
  data: { data: 'value', headers: {}, status: 200, statusText: '200 OK' }
} as const;

describe('Tests UpdateCache', () => {
  it('`delete` key with CacheUpdaterFn', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: () => axios.storage.remove(CACHE_KEY) }
    });

    const cacheValue1 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue1, { state: 'empty' });

    //

    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key2', {
      cache: { update: () => axios.storage.remove(CACHE_KEY) }
    });

    const cacheValue3 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue3, { state: 'empty' });
  });

  it('`delete` key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: { [CACHE_KEY]: 'delete' } }
    });

    const cacheValue1 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue1, { state: 'empty' });

    //

    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key2', {
      cache: {
        update: {
          [CACHE_KEY]: () => 'delete'
        }
      }
    });

    const cacheValue2 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue2, { state: 'empty' });

    //

    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key3', {
      cache: { update: { [CACHE_KEY]: () => Promise.resolve('delete') } }
    });

    const cacheValue3 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue3, { state: 'empty' });
  });

  it('`ignore` key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: { [CACHE_KEY]: () => 'ignore' } }
    });

    const cacheValue = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue, CACHED_VALUE);

    //

    await axios.get('other-key2', {
      cache: { update: { [CACHE_KEY]: async () => Promise.resolve('ignore') } }
    });

    const cacheValue2 = await axios.storage.get(CACHE_KEY);
    assert.deepEqual(cacheValue2, CACHED_VALUE);
  });

  it('New cached storage values', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: {
        update: {
          [CACHE_KEY]: (cached) => {
            if (cached.state !== 'cached') {
              return 'ignore';
            }

            return {
              ...cached,
              data: { ...cached.data, data: 1 }
            };
          }
        }
      }
    });

    const cacheValue = await axios.storage.get(CACHE_KEY);
    assert.notDeepEqual(cacheValue, CACHED_VALUE);
    assert.equal(cacheValue.data?.data, 1);
  });

  it('updateCache() with key is loading', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, { state: 'loading', previous: 'empty' });

    const handler = mock.fn(() => 'ignore' as const);

    await axios.get('other-key', {
      cache: {
        update: {
          [CACHE_KEY]: handler
        }
      }
    });

    assert.equal(handler.mock.callCount(), 0);

    const cacheValue = await axios.storage.get(CACHE_KEY);
    assert.equal(cacheValue.state, 'loading');
  });

  it('updateCache() with non cached updater', async () => {
    const ID = 'cache-id';

    const axios = mockAxios({ methods: ['get'] });

    await axios.get('url', { id: ID });

    // post isn't inside `methods`
    await axios.post('url', true, {
      cache: {
        update: { [ID]: 'delete' }
      }
    });

    // if the update did not get executed, the cache shouldn't be empty
    const cacheValue = await axios.storage.get(ID);

    assert.equal(cacheValue.state, 'empty');
  });
});
