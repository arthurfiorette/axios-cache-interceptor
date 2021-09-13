import { AxiosCacheInstance, StorageValue } from '../../src';
import { updateCache } from '../../src/util/update-cache';
import { mockAxios } from '../mocks/axios';

const KEY = 'cacheKey';
const EMPTY_STATE = { state: 'empty' };
const DEFAULT_DATA = 'random-data';
const INITIAL_DATA: StorageValue = { data: { body: true }, expiration: Infinity, state: 'cached' };

describe('Tests update-cache', () => {
  let axios: AxiosCacheInstance;

  beforeEach(() => {
    axios = mockAxios({});

    axios.storage.set(KEY, INITIAL_DATA);
  });

  it('tests for delete key', async () => {
    await updateCache(axios, DEFAULT_DATA, {
      [KEY]: 'delete'
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).toStrictEqual(EMPTY_STATE);
  });

  it('tests for returning undefined', async () => {
    await updateCache(axios, DEFAULT_DATA, {
      [KEY]: () => undefined
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).toStrictEqual(EMPTY_STATE);
  });

  it('tests for returning an new value', async () => {
    await updateCache(axios, DEFAULT_DATA, {
      [KEY]: (cached, newData) => ({
        state: 'cached',
        expiration: Infinity,
        data: { body: `${cached.data?.body}:${newData}` }
      })
    });

    const response = await axios.storage.get(KEY);

    expect(response).not.toBeFalsy();
    expect(response).not.toStrictEqual(EMPTY_STATE);

    expect(response.state).toBe('cached');
    expect(response.data?.body).toBe(`${INITIAL_DATA.data.body}:${DEFAULT_DATA}`);
  });
});
