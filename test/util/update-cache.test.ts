import type { AxiosRequestHeaders } from 'axios';
import type { CachedStorageValue } from '../../src/storage/types';
import { defaultKeyGenerator } from '../../src/util/key-generator';
import { mockAxios } from '../mocks/axios';

const CACHE_KEY = defaultKeyGenerator({
  url: 'https://example.com/',
  headers: {} as AxiosRequestHeaders
});
const CACHED_VALUE: CachedStorageValue = Object.freeze({
  createdAt: Date.now(),
  state: 'cached',
  ttl: Number.MAX_SAFE_INTEGER, // never expires
  data: { data: 'value', headers: {}, status: 200, statusText: '200 OK' }
});

describe('Tests update-cache', () => {
  it('tests for delete key with CacheUpdaterFn', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: () => axios.storage.remove(CACHE_KEY) }
    });

    const cacheValue1 = await axios.storage.get(CACHE_KEY);
    expect(cacheValue1).toStrictEqual({ state: 'empty' });

    //

    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key2', {
      cache: { update: () => axios.storage.remove(CACHE_KEY) }
    });

    const cacheValue3 = await axios.storage.get(CACHE_KEY);
    expect(cacheValue3).toStrictEqual({ state: 'empty' });
  });

  it('tests for delete key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: { [CACHE_KEY]: 'delete' } }
    });

    const cacheValue1 = await axios.storage.get(CACHE_KEY);
    expect(cacheValue1).toStrictEqual({ state: 'empty' });

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
    expect(cacheValue2).toStrictEqual({ state: 'empty' });

    //

    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key3', {
      cache: { update: { [CACHE_KEY]: () => Promise.resolve('delete') } }
    });

    const cacheValue3 = await axios.storage.get(CACHE_KEY);
    expect(cacheValue3).toStrictEqual({ state: 'empty' });
  });

  it('tests for ignore key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, CACHED_VALUE);

    await axios.get('other-key', {
      cache: { update: { [CACHE_KEY]: () => 'ignore' } }
    });

    const cacheValue = await axios.storage.get(CACHE_KEY);
    expect(cacheValue).toStrictEqual(CACHED_VALUE);

    //

    await axios.get('other-key2', {
      cache: { update: { [CACHE_KEY]: async () => Promise.resolve('ignore') } }
    });

    const cacheValue2 = await axios.storage.get(CACHE_KEY);
    expect(cacheValue2).toStrictEqual(CACHED_VALUE);
  });

  it('tests for new cached storage value', async () => {
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
    expect(cacheValue).not.toStrictEqual(CACHED_VALUE);
    expect(cacheValue.data?.data).toBe(1);
  });

  it('tests updateCache with key is loading', async () => {
    const axios = mockAxios({});
    await axios.storage.set(CACHE_KEY, { state: 'loading', previous: 'empty' });

    const handler = jest.fn();

    await axios.get('other-key', {
      cache: {
        update: {
          [CACHE_KEY]: handler
        }
      }
    });

    expect(handler).not.toHaveBeenCalled();

    const cacheValue = await axios.storage.get(CACHE_KEY);
    expect(cacheValue.state).toBe('loading');
  });

  it('tests updateCache with non cached updater', async () => {
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

    expect(cacheValue.state).toBe('empty');
  });
});
