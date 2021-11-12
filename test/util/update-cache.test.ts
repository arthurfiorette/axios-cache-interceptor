import type { AxiosCacheInstance, CachedStorageValue } from '../../src';
import { updateCache } from '../../src/util/update-cache';
import { mockAxios } from '../mocks/axios';
import { EMPTY_RESPONSE } from '../utils';

const KEY = 'cacheKey';
const EMPTY_STATE = { state: 'empty' };
const DEFAULT_DATA = 'random-data';
const INITIAL_DATA: CachedStorageValue = {
  data: {
    ...EMPTY_RESPONSE,
    data: true
  },
  createdAt: Date.now(),
  ttl: Infinity,
  state: 'cached'
};

describe('Tests update-cache', () => {
  let axios: AxiosCacheInstance;

  beforeEach(() => {
    axios = mockAxios({});
    axios.storage.set(KEY, INITIAL_DATA);
  });

  it('tests for delete key', async () => {
    await updateCache(axios.storage, DEFAULT_DATA, {
      [KEY]: 'delete'
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).toStrictEqual(EMPTY_STATE);
  });

  it('tests for returning undefined', async () => {
    await updateCache(axios.storage, DEFAULT_DATA, {
      [KEY]: () => undefined
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).toStrictEqual(EMPTY_STATE);
  });

  it('tests for returning an new value', async () => {
    await updateCache(axios.storage, DEFAULT_DATA, {
      [KEY]: (cached, newData) => ({
        state: 'cached',
        ttl: Infinity,
        createdAt: Date.now(),
        data: {
          ...EMPTY_RESPONSE,
          data: `${cached.data?.data}:${newData}`
        }
      })
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).not.toStrictEqual(EMPTY_STATE);

    expect(response.state).toBe('cached');
    expect(response.data?.data).toBe(`${INITIAL_DATA.data?.data}:${DEFAULT_DATA}`);
  });

  it('check if the state is loading while updating', async () => {
    axios.storage.set(KEY, { state: 'loading' });

    const result = updateCache(axios.storage, DEFAULT_DATA, {
      [KEY]: (cached, newData) => ({
        state: 'cached',
        ttl: Infinity,
        createdAt: Date.now(),
        data: {
          ...EMPTY_RESPONSE,
          data: `${cached.data?.data}:${newData}`
        }
      })
    });

    expect(result).rejects.toThrowError();
  });
});
