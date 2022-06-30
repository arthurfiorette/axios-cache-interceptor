import type { CachedStorageValue } from '../../src/storage/types';
import { defaultKeyGenerator } from '../../src/util/key-generator';
import { mockAxios } from '../mocks/axios';

const cacheKey = defaultKeyGenerator({ url: 'https://example.com/' });
const cachedValue: CachedStorageValue = {
  createdAt: Date.now(),
  state: 'cached',
  ttl: Number.MAX_SAFE_INTEGER, // never expires
  data: {
    data: 'value',
    headers: {},
    status: 200,
    statusText: '200 OK'
  }
};

describe('Tests update-cache', () => {
  it('tests for delete key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(cacheKey, cachedValue);

    await axios.get('other-key', {
      cache: { update: { [cacheKey]: 'delete' } }
    });

    const cacheValue1 = await axios.storage.get(cacheKey);
    expect(cacheValue1).toStrictEqual({ state: 'empty' });

    //

    await axios.storage.set(cacheKey, cachedValue);

    await axios.get('other-key2', {
      cache: {
        update: {
          [cacheKey]: () => 'delete'
        }
      }
    });

    const cacheValue2 = await axios.storage.get(cacheKey);
    expect(cacheValue2).toStrictEqual({ state: 'empty' });

    //

    await axios.storage.set(cacheKey, cachedValue);

    await axios.get('other-key3', {
      cache: { update: { [cacheKey]: () => Promise.resolve('delete') } }
    });

    const cacheValue3 = await axios.storage.get(cacheKey);
    expect(cacheValue3).toStrictEqual({ state: 'empty' });
  });

  it('tests for ignore key', async () => {
    const axios = mockAxios({});
    await axios.storage.set(cacheKey, cachedValue);

    await axios.get('other-key', {
      cache: { update: { [cacheKey]: () => 'ignore' } }
    });

    const cacheValue = await axios.storage.get(cacheKey);
    expect(cacheValue).toStrictEqual(cachedValue);

    //

    await axios.get('other-key2', {
      cache: { update: { [cacheKey]: async () => Promise.resolve('ignore') } }
    });

    const cacheValue2 = await axios.storage.get(cacheKey);
    expect(cacheValue2).toStrictEqual(cachedValue);
  });

  it('tests for new cached storage value', async () => {
    const axios = mockAxios({});
    await axios.storage.set(cacheKey, cachedValue);

    await axios.get('other-key', {
      cache: {
        update: {
          [cacheKey]: (cached) => {
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

    const cacheValue = await axios.storage.get(cacheKey);
    expect(cacheValue).not.toStrictEqual(cachedValue);
    expect(cacheValue.data?.data).toBe(1);
  });

  it('tests updateCache with key is loading', async () => {
    const axios = mockAxios({});
    await axios.storage.set(cacheKey, { state: 'loading', previous: 'empty' });

    const handler = jest.fn();

    await axios.get('other-key', {
      cache: {
        update: {
          [cacheKey]: handler
        }
      }
    });

    expect(handler).not.toHaveBeenCalled();

    const cacheValue = await axios.storage.get(cacheKey);
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
