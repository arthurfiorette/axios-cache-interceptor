import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import type { AxiosAdapter, AxiosResponse } from 'axios';
import type {
  CacheRequestConfig,
  InternalCacheRequestConfig
} from '../../src/cache/axios.js';
import { Header } from '../../src/header/headers.js';
import { buildMemoryStorage } from '../../src/index.js';
import type { LoadingStorageValue } from '../../src/storage/types.js';
import { mockAxios } from '../mocks/axios.js';
import { mockDateNow } from '../utils.js';

describe('Request Interceptor', () => {
  it('Against specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const response = await axios.get('http://test.com');
    const cacheKey = axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    assert.equal(cache.state, 'empty');
  });

  it('Specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const response = await axios.get('http://test.com');
    const cacheKey = axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    assert.equal(cache.state, 'cached');
  });

  it('Concurrent requests', async () => {
    const axios = mockAxios();

    const [resp1, resp2] = await Promise.all([
      axios.get('http://test.com'),
      axios.get('http://test.com')
    ]);

    assert.equal(resp1.cached, false);
    assert.equal(resp1.stale, undefined);
    assert.ok(resp2.cached);
    assert.equal(resp2.stale, false);
  });

  it('Concurrent requests with `cache: false`', async () => {
    const axios = mockAxios();

    const results = await Promise.all([
      axios.get('http://test.com', { cache: false }),
      axios.get('http://test.com'),
      axios.get('http://test.com', { cache: false })
    ]);
    for (const result of results) {
      assert.equal(result.cached, false);
      assert.equal(result.stale, undefined);
    }
  });

  /**
   * This is to test when two requests are made simultaneously. With that, the second
   * response waits the deferred from the first one. Because the first request is not
   * cached, the second should not be waiting forever for the deferred to be resolved with
   * a cached response.
   */
  it('Concurrent requests with uncached responses', async () => {
    const axios = mockAxios();

    const [, resp2] = await Promise.all([
      axios.get('http://test.com', {
        // Simple predicate to ignore cache in the response step.
        cache: { cachePredicate: () => false }
      }),
      axios.get('http://test.com')
    ]);

    assert.equal(resp2.cached, false);
    assert.equal(resp2.stale, undefined);
  });

  it('`response.cached` is present', async () => {
    const axios = mockAxios();

    const response = await axios.get('http://test.com');
    assert.equal(response.cached, false);
    assert.equal(response.stale, undefined);

    const response2 = await axios.get('http://test.com');
    assert.ok(response2.cached);
    assert.equal(response2.stale, false);

    const response3 = await axios.get('http://test.com', {
      id: 'random-id'
    });
    assert.equal(response3.cached, false);
    assert.equal(response3.stale, undefined);

    const response4 = await axios.get('http://test.com', {
      id: 'random-id'
    });
    assert.ok(response4.cached);
    assert.equal(response4.stale, false);
  });

  it('Cache expiration', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=1,stale-while-revalidate=10' }
    );

    await axios.get('http://test.com', {
      cache: { interpretHeader: true }
    });

    const resultCache = await axios.get('http://test.com');
    assert.ok(resultCache.cached);
    assert.equal(resultCache.stale, false);

    // Sleep entire max age time (using await to function as setImmediate)
    await mockDateNow(1000);

    const response2 = await axios.get('http://test.com');
    assert.equal(response2.cached, false);
    assert.equal(response2.stale, undefined);
  });

  it('`must revalidate` does not allows stale', async () => {
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

    assert.equal(res1.cached, false);
    assert.equal(res1.stale, undefined);
    const headers1 = res1.headers as Record<string, string>;
    const headers2 = res2.headers as Record<string, string>;
    assert.equal(headers1['x-mock-random'], headers2['x-mock-random']);
    assert.ok(res2.cached);
    assert.equal(res2.stale, false);
    assert.ok(res3.cached);
    assert.equal(res3.stale, false);

    // waits one second (using await to function as setImmediate)
    await mockDateNow(1000);

    const res4 = await axios.get('url', config);

    // Should be different because the call it may not serve stale
    const headers4 = res4.headers as Record<string, string>;
    assert.notEqual(headers1['x-mock-random'], headers4['x-mock-random']);
  });

  it('Expects two requests with different body are not cached', async () => {
    const axios = mockAxios();

    const result = await axios.get('url', { data: { a: 1 } });

    assert.equal(result.cached, false);
    assert.equal(result.stale, undefined);

    const result2 = await axios.get('url', { data: { a: 2 } });

    assert.equal(result2.cached, false);
    assert.equal(result2.stale, undefined);
  });

  it('Tests a request with really long keys', async () => {
    const axios = mockAxios();

    const result = await axios.get('url', {
      data: Array(5e3).fill({ rnd: Math.random() }),
      params: Array(5e3).fill({ rnd: Math.random() })
    });

    assert.ok(result);
  });

  it('Expect KeyGenerator is called once during a single request', async () => {
    const axios = mockAxios();

    const spy = mock.method(axios, 'generateKey');

    await axios.get('url', {
      // generates a long key
      data: Array(5e3).fill({ rnd: Math.random() })
    });

    assert.equal(spy.mock.callCount(), 1);
  });

  it('Deleting a cache in the middle of a request should be fine', async () => {
    const ID = 'custom-id';
    const axios = mockAxios();

    await axios.get('url', {
      id: ID,

      // A simple adapter that deletes the current cache
      // before resolving the adapter. Simulates when a user
      // manually deletes this key before it can be resolved.
      adapter: async (config: InternalCacheRequestConfig) => {
        await axios.storage.remove(config.id!);
        return (axios.defaults.adapter as AxiosAdapter)(config);
      }
    });

    // Expects that the cache is empty (deleted above) and
    // it still has a waiting entry.
    const { state } = await axios.storage.get(ID);
    assert.equal(state, 'empty');
    assert.ok(axios.waiting.get(ID));

    // This line should throw an error if this bug isn't fixed.
    await axios.get('url', { id: ID });

    const { state: newState } = await axios.storage.get(ID);

    assert.notEqual(newState, 'empty');
    assert.equal(axios.waiting.get(ID), undefined);
  });

  it('`cache.override = true` with previous cache', async () => {
    const axios = mockAxios();

    // First normal request to populate cache
    const { id, ...initialResponse } = await axios.get('url');

    assert.equal(initialResponse.cached, false);
    assert.equal(initialResponse.stale, undefined);

    // Ensure cache was populated
    const c1 = await axios.storage.get(id);
    assert.equal(c1.state, 'cached');

    // Make a request with cache.override = true
    const promise = axios.get('url', {
      id,
      cache: { override: true },

      // Simple adapter that resolves after the deferred is completed.
      adapter: async (config: InternalCacheRequestConfig) => {
        await setTimeout(10);

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
      await setTimeout(5);

      const c2 = (await axios.storage.get(id)) as LoadingStorageValue;

      assert.equal(c2.state, 'loading');
      assert.equal(c2.previous, 'stale');
      assert.equal(c2.data, c1.data);
      assert.equal(c2.createdAt, c1.createdAt);
    }

    // Waits for the promise completion
    const newResponse = await promise;

    // This step is after the cache was updated with the new response.
    {
      const c3 = await axios.storage.get(id);

      assert.equal(newResponse.cached, false);
      assert.equal(newResponse.stale, undefined);
      assert.equal(c3.state, 'cached');
      assert.notEqual(c3.data, c1.data); // `'overridden response'`, not `true`
      assert.notEqual(c3.createdAt, c1.createdAt);
    }
  });

  it('`cache.override = true` without previous cache', async () => {
    const id = 'CUSTOM_RANDOM_ID';

    const axios = mockAxios();

    const c1 = await axios.storage.get(id);

    assert.equal(c1.state, 'empty');

    // Make a request with cache.override = true
    const promise = axios.get('url', {
      id,
      cache: { override: true },

      // Simple adapter that resolves after the deferred is completed.
      adapter: async (config: InternalCacheRequestConfig) => {
        await setTimeout(10);
        return (axios.defaults.adapter as AxiosAdapter)(config);
      }
    });

    // These two setTimeouts is to ensure this code is executed after
    // the request interceptor, but before the response interceptor.
    // Leading to test the intermediate loading state.

    {
      await setTimeout(5);

      const c2 = (await axios.storage.get(id)) as LoadingStorageValue;

      assert.equal(c2.state, 'loading');
      assert.equal(c2.previous, 'empty');

      assert.equal(c2.data, undefined);
      assert.notEqual(c2.createdAt, c1.createdAt);
    }

    // Waits for the promise completion
    const newResponse = await promise;

    // This step is after the cache was updated with the new response.
    {
      const c3 = await axios.storage.get(id);

      assert.equal(newResponse.cached, false);
      assert.equal(newResponse.stale, undefined);
      assert.equal(c3.state, 'cached');
      assert.ok(c3.data);
      assert.notEqual(c3.createdAt, c1.createdAt);
    }
  });

  it('ensures override can be used globally', async () => {
    const axios = mockAxios({ override: true });

    const { config } = await axios.get('url');

    assert.equal((config.cache as any).override, true);
  });

  it('Requests are made with CacheControl no-cache', async () => {
    const axios = mockAxios({ cacheTakeover: true });

    const req1 = await axios.get('url');

    assert.deepEqual(Object.assign({}, req1.request.config.headers), {
      [Header.CacheControl]: 'no-cache',
      Accept: 'application/json, text/plain, */*',
      'Content-Type': undefined,
      [Header.Pragma]: 'no-cache',
      [Header.Expires]: '0'
    });

    const req2 = await axios.get('url2', {
      cache: { cacheTakeover: false }
    });

    const headers2 = req2.request.config.headers as Record<string, string>;
    assert.equal(headers2[Header.CacheControl], undefined);
    assert.equal(headers2[Header.Pragma], undefined);
    assert.equal(headers2[Header.Expires], undefined);
  });

  it('ensure cached data is not transformed', async () => {
    const axios = mockAxios();

    // data will transformed with first request
    const res1 = await axios.get('url', {
      transformResponse: (data: unknown) => [data]
    });

    assert.notEqual(res1.config.transformResponse, undefined);

    // cached data should not transform the data as it is alread in desired format.
    // transform function is nullified in this scenario
    const res2 = await axios.get('url', {
      transformResponse: (data: unknown) => [data]
    });

    assert.equal(res2.config.transformResponse, undefined);
  });

  it('ensures request with urls in exclude.paths are not cached', async () => {
    const axios = mockAxios({
      cachePredicate: {
        ignoreUrls: ['url']
      }
    });

    const [req0, req1] = await Promise.all([axios.get('url'), axios.get('url')]);

    assert.equal(req0.cached, false);
    assert.equal(req0.stale, undefined);
    assert.equal(req1.cached, false);
    assert.equal(req1.stale, undefined);

    const [req2, req3] = await Promise.all([
      axios.get('some-other'),
      axios.get('some-other')
    ]);

    assert.equal(req2.cached, false);
    assert.equal(req2.stale, undefined);
    assert.ok(req3.cached);
    assert.equal(req3.stale, false);
  });

  it('ensures request with urls in exclude.paths are not cached (regex)', async () => {
    const axios = mockAxios({
      cachePredicate: {
        ignoreUrls: [/url/]
      }
    });

    const [req0, req1] = await Promise.all([axios.get('my/url'), axios.get('my/url')]);

    assert.equal(req0.cached, false);
    assert.equal(req0.stale, undefined);
    assert.equal(req1.cached, false);
    assert.equal(req1.stale, undefined);

    const [req2, req3] = await Promise.all([
      axios.get('some-other'),
      axios.get('some-other')
    ]);

    assert.equal(req2.cached, false);
    assert.equal(req2.stale, undefined);
    assert.ok(req3.cached);
    assert.equal(req3.stale, false);

    const [req4, req5] = await Promise.all([
      axios.get('other/url'),
      axios.get('other/url')
    ]);

    assert.equal(req4.cached, false);
    assert.equal(req4.stale, undefined);
    assert.equal(req5.cached, false);
    assert.equal(req5.stale, undefined);
  });

  it('clone works with concurrent requests', async () => {
    const axios = mockAxios(
      {
        storage: buildMemoryStorage('double')
      },
      undefined,
      undefined,
      () => ({ a: 1 })
    );

    await Promise.all(
      Array.from({ length: 10 }, async () => {
        const result = await axios.get<{ a: 1 }>('/url');
        result.data.a++;
        assert.equal(result.data.a, 2);
      })
    );
  });

  it('clone works with sequential requests', async () => {
    const axios = mockAxios(
      {
        storage: buildMemoryStorage('double')
      },
      undefined,
      undefined,
      () => ({ a: 1 })
    );

    for (let i = 0; i < 10; i++) {
      const result = await axios.get<{ a: 1 }>('/url');
      result.data.a++;
      assert.equal(result.data.a, 2);
    }
  });
});
