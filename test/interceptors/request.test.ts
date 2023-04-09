import type { AxiosAdapter, AxiosResponse } from 'axios';
import { setTimeout } from 'timers/promises';
import type {
  CacheRequestConfig,
  InternalCacheRequestConfig
} from '../../src/cache/axios';
import { Header } from '../../src/header/headers';
import type { LoadingStorageValue } from '../../src/storage/types';
import { mockAxios } from '../mocks/axios';
import { sleep } from '../utils';

describe('test request interceptor', () => {
  it('tests against specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const response = await axios.get('http://test.com');
    const cacheKey = axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('empty');
  });

  it('tests specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const response = await axios.get('http://test.com');
    const cacheKey = axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('cached');
  });

  it('tests concurrent requests', async () => {
    const axios = mockAxios();

    const [resp1, resp2] = await Promise.all([
      axios.get('http://test.com'),
      axios.get('http://test.com')
    ]);

    expect(resp1.cached).toBe(false);
    expect(resp2.cached).toBe(true);
  });

  it('tests concurrent requests with cache: false', async () => {
    const axios = mockAxios();

    const results = await Promise.all([
      axios.get('http://test.com', { cache: false }),
      axios.get('http://test.com'),
      axios.get('http://test.com', { cache: false })
    ]);
    for (const result of results) {
      expect(result.cached).toBe(false);
    }
  });

  /**
   * This is to test when two requests are made simultaneously. With that, the second
   * response waits the deferred from the first one. Because the first request is not
   * cached, the second should not be waiting forever for the deferred to be resolved with
   * a cached response.
   */
  it('tests concurrent requests with uncached responses', async () => {
    const axios = mockAxios();

    const [, resp2] = await Promise.all([
      axios.get('http://test.com', {
        // Simple predicate to ignore cache in the response step.
        cache: { cachePredicate: () => false }
      }),
      axios.get('http://test.com')
    ]);

    expect(resp2.cached).toBe(false);
  });

  it('tests response.cached', async () => {
    const axios = mockAxios();

    const response = await axios.get('http://test.com');
    expect(response.cached).toBe(false);

    const response2 = await axios.get('http://test.com');
    expect(response2.cached).toBe(true);

    const response3 = await axios.get('http://test.com', { id: 'random-id' });
    expect(response3.cached).toBe(false);

    const response4 = await axios.get('http://test.com', { id: 'random-id' });
    expect(response4.cached).toBe(true);
  });

  it('test cache expiration', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=1,stale-while-revalidate=10' }
    );

    await axios.get('http://test.com', { cache: { interpretHeader: true } });

    const resultCache = await axios.get('http://test.com');
    expect(resultCache.cached).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('http://test.com');
    expect(response2.cached).toBe(false);
  });

  test('"must revalidate" does not allows stale', async () => {
    const axios = mockAxios(
      {},
      {
        [Header.CacheControl]: 'must-revalidate, max-age=1',
        // etag is a header that should make the cache stale
        [Header.ETag]: 'W/123'
      }
    );

    const config: CacheRequestConfig = {
      id: 'req-id',
      cache: {
        interpretHeader: true,
        etag: true
      }
    };

    const res1 = await axios.get('url', config);
    const res2 = await axios.get('url', config);
    const res3 = await axios.get('url', config);

    expect(res1.cached).toBeFalsy();
    expect(res2.cached).toBeTruthy();
    expect(res3.cached).toBeTruthy();

    // waits one second
    await sleep(1000);

    const res4 = await axios.get('url', config);

    // Should be false because the cache couldn't be stale
    expect(res4.cached).toBeFalsy();
  });

  it("expect two requests with different body aren't cached", async () => {
    const axios = mockAxios();

    const result = await axios.get('url', { data: { a: 1 } });

    expect(result.cached).toBe(false);

    const result2 = await axios.get('url', { data: { a: 2 } });

    expect(result2.cached).toBe(false);
  });

  it('tests a request with really long keys', async () => {
    const axios = mockAxios();

    const result = await axios.get('url', {
      data: Array(5e3).fill({ rnd: Math.random() }),
      params: Array(5e3).fill({ rnd: Math.random() })
    });

    expect(result).toBeDefined();
  });

  it('expect keyGenerator is called once during a single request', async () => {
    const axios = mockAxios();

    const spy = jest.spyOn(axios, 'generateKey');

    await axios.get('url', {
      // generates a long key
      data: Array(5e3).fill({ rnd: Math.random() })
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Deleting a cache in the middle of a request should be fine', async () => {
    const ID = 'custom-id';
    const axios = mockAxios();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await axios.get('url', {
      id: ID,

      // A simple adapter that deletes the current cache
      // before resolving the adapter. Simulates when a user
      // manually deletes this key before it can be resolved.
      adapter: async (config: InternalCacheRequestConfig) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await axios.storage.remove(config.id!);
        return (axios.defaults.adapter as AxiosAdapter)(config);
      }
    });

    // Expects that the cache is empty (deleted above) and
    // it still has a waiting entry.
    const { state } = await axios.storage.get(ID);
    expect(state).toBe('empty');
    expect(axios.waiting[ID]).toBeDefined();

    // This line should throw an error if this bug isn't fixed.
    await axios.get('url', { id: ID });

    const { state: newState } = await axios.storage.get(ID);

    expect(newState).not.toBe('empty');
    expect(axios.waiting[ID]).toBeUndefined();
  });

  it('tests cache.override = true with previous cache', async () => {
    const axios = mockAxios();

    // First normal request to populate cache
    const { id, ...initialResponse } = await axios.get('url');

    expect(initialResponse.cached).toBe(false);

    // Ensure cache was populated
    const c1 = await axios.storage.get(id);
    expect(c1.state).toBe('cached');

    // Make a request with cache.override = true
    const promise = axios.get('url', {
      id,
      cache: { override: true },

      // Simple adapter that resolves after the deferred is completed.
      adapter: async (config: InternalCacheRequestConfig) => {
        await setTimeout(150);

        const response = (await (axios.defaults.adapter as AxiosAdapter)(
          config
        )) as AxiosResponse;

        // Changes the response to be different from `true` (default)
        response.data = 'overridden response';

        return response;
      }
    });

    // These two setTimeouts is to ensure this code is executed after
    // the request interceptor, but before the response interceptor.
    // Leading to test the intermediate loading state.

    {
      await setTimeout(50);

      const c2 = (await axios.storage.get(id)) as LoadingStorageValue;

      expect(c2.state).toBe('loading');
      expect(c2.previous).toBe('stale');
      expect(c2.data).toBe(c1.data);
      expect(c2.createdAt).toBe(c1.createdAt);
    }

    // Waits for the promise completion
    const newResponse = await promise;

    // This step is after the cache was updated with the new response.
    {
      const c3 = await axios.storage.get(id);

      expect(newResponse.cached).toBe(false);
      expect(c3.state).toBe('cached');
      expect(c3.data).not.toBe(c1.data); // `'overridden response'`, not `true`
      expect(c3.createdAt).not.toBe(c1.createdAt);
    }
  });

  it('tests cache.override = true without previous cache', async () => {
    const id = 'CUSTOM_RANDOM_ID';

    const axios = mockAxios();

    const c1 = await axios.storage.get(id);

    expect(c1.state).toBe('empty');

    // Make a request with cache.override = true
    const promise = axios.get('url', {
      id,
      cache: { override: true },

      // Simple adapter that resolves after the deferred is completed.
      adapter: async (config: InternalCacheRequestConfig) => {
        await setTimeout(150);

        return (axios.defaults.adapter as AxiosAdapter)(config);
      }
    });

    // These two setTimeouts is to ensure this code is executed after
    // the request interceptor, but before the response interceptor.
    // Leading to test the intermediate loading state.

    {
      await setTimeout(50);

      const c2 = (await axios.storage.get(id)) as LoadingStorageValue;

      expect(c2.state).toBe('loading');
      expect(c2.previous).toBe('empty');

      expect(c2.data).toBeUndefined();
      expect(c2.createdAt).not.toBe(c1.createdAt);
    }

    // Waits for the promise completion
    const newResponse = await promise;

    // This step is after the cache was updated with the new response.
    {
      const c3 = await axios.storage.get(id);

      expect(newResponse.cached).toBe(false);
      expect(c3.state).toBe('cached');

      expect(c3.data).not.toBeUndefined();
      expect(c3.createdAt).not.toBe(c1.createdAt);
    }
  });

  it('expect requests are made with cache-control=no-cache', async () => {
    const axios = mockAxios({ cacheTakeover: true });

    const req1 = await axios.get('url');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(req1.request.config.headers).toMatchObject({
      [Header.CacheControl]: 'no-cache',
      [Header.Pragma]: 'no-cache',
      [Header.Expires]: '0'
    });

    const req2 = await axios.get('url2', {
      cache: { cacheTakeover: false }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const headers2 = req2.request.config.headers as CacheRequestConfig;
    expect(headers2).not.toHaveProperty(Header.CacheControl);
    expect(headers2).not.toHaveProperty(Header.Pragma);
    expect(headers2).not.toHaveProperty(Header.Expires);
  });
});
