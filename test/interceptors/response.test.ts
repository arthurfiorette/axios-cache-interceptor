import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import Axios from 'axios';
import { setupCache } from '../../src/cache/create.js';
import { Header } from '../../src/header/headers.js';
import { XMockRandom, mockAxios } from '../mocks/axios.js';

describe('Response Interceptor', () => {
  it('`storage.get` call without specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const spy = mock.method(axios.storage, 'get');
    await axios.get('http://test.com');

    assert.equal(spy.mock.callCount(), 0);
  });

  it('`storage.get` call with specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const spy = mock.method(axios.storage, 'get');
    await axios.get('http://test.com');

    assert.ok(spy.mock.callCount() >= 1);
  });

  it('Expects error for `storage.get` calls against specified methods', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    // only cache post methods
    axios.defaults.cache.methods = ['post'];

    const spy = mock.method(axios.storage, 'get');

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.equal(spy.mock.callCount(), 0);
    }
  });

  it('Expects error for `storage.get` call with specified methods', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});
    // only cache get methods
    axios.defaults.cache.methods = ['get'];

    const spy = mock.method(axios.storage, 'get');

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(spy.mock.callCount() >= 1);
    }
  });

  it('CachePredicate integration', async () => {
    const axios = mockAxios();

    const fetch = () =>
      axios.get('http://test.com', {
        cache: {
          cachePredicate: {
            responseMatch: () => false
          }
        }
      });

    // Make first request to cache it
    await fetch();
    const result = await fetch();

    assert.equal(result.cached, false);
    assert.equal(result.stale, undefined);
  });

  it('HeaderInterpreter integration', async () => {
    const axiosNoCache = mockAxios({}, { [Header.CacheControl]: 'no-cache' });

    // Make first request to cache it
    await axiosNoCache.get('http://test.com', { cache: { interpretHeader: true } });
    const resultNoCache = await axiosNoCache.get('http://test.com');

    assert.equal(resultNoCache.cached, false);
    assert.equal(resultNoCache.stale, undefined);

    const axiosCache = mockAxios({}, { [Header.CacheControl]: `max-age=${60 * 60 * 24 * 365}` });

    // Make first request to cache it
    await axiosCache.get('http://test.com', { cache: { interpretHeader: true } });
    const resultCache = await axiosCache.get('http://test.com');

    assert.ok(resultCache.cached);
    assert.equal(resultCache.stale, false);
  });

  it('Update cache integration', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('key01');

    await axios.get('key02', {
      cache: {
        update: {
          [id]: 'delete' as const
        }
      }
    });

    const cache = await axios.storage.get(id);

    assert.equal(cache.state, 'empty');
  });

  it('Blank CacheControl header', async () => {
    const defaultTtl = 60;

    const axios = mockAxios(
      { ttl: defaultTtl, interpretHeader: true },
      { [Header.CacheControl]: '' }
    );

    const { id } = await axios.get('key01', {
      cache: {
        interpretHeader: true
      }
    });

    const cache = await axios.storage.get(id);

    assert.equal(cache.state, 'cached');
    assert.equal(cache.ttl, defaultTtl);
  });

  it('TTL with functions', async () => {
    const axios = mockAxios();
    const id = 'my-id';

    // first request (cached by tll)

    await axios.get('url', {
      id,
      cache: {
        ttl: (resp) => {
          assert.equal(resp.cached, false);
          assert.equal(resp.stale, undefined);
          assert.ok(resp.config);
          assert.notEqual(resp.headers[XMockRandom], NaN);
          assert.equal(resp.status, 200);
          assert.equal(resp.statusText, '200 OK');
          assert.ok(resp.data);

          return 100;
        }
      }
    });

    const cache1 = await axios.storage.get(id);
    assert.equal(cache1.state, 'cached');
    assert.equal(cache1.ttl, 100);

    // Second request (cached by ttl)
    const ttl = mock.fn(() => 200);

    await axios.get('url', {
      id,
      cache: { ttl }
    });

    const cache2 = await axios.storage.get(id);
    assert.equal(cache2.state, 'cached');
    assert.equal(cache2.ttl, 100);

    assert.equal(ttl.mock.callCount(), 0);

    // Force invalidation
    await axios.storage.remove(id);
  });

  it('Async ttl function', async () => {
    const axios = mockAxios();

    // A lot of promises and callbacks
    const { id } = await axios.get('url', {
      cache: {
        ttl: async () => {
          await setImmediate(); // jumps to next nodejs event loop tick

          return new Promise((res) => {
            setTimeout(() => {
              process.nextTick(() => {
                res(173);
              });
            }, 20);
          });
        }
      }
    });

    const cache = await axios.storage.get(id);
    assert.equal(cache.state, 'cached');
    assert.equal(cache.ttl, 173);
  });

  it('Ensures a request id has been generated even with `cache: false`', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('url', { cache: false });

    assert.ok(id);
    assert.equal(typeof id, 'string');
  });

  it('Any X-axios-cache header gets removed', async () => {
    const headerValue = '23asdf8ghd';

    const axios = mockAxios(
      {},
      {
        [Header.XAxiosCacheEtag]: headerValue,
        [Header.XAxiosCacheLastModified]: headerValue,
        [Header.XAxiosCacheStaleIfError]: headerValue
      }
    );

    const { headers } = await axios.get('url');

    assert.notEqual(headers[Header.XAxiosCacheEtag], headerValue);
    assert.notEqual(headers[Header.XAxiosCacheLastModified], headerValue);
    assert.notEqual(headers[Header.XAxiosCacheStaleIfError], headerValue);
  });

  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/317
  it('Aborted requests clears its cache afterwards', async () => {
    const id = 'abort-request-id';
    const ac = new AbortController();
    const axios = mockAxios();

    const promise = axios.get('url', { id, signal: ac.signal });

    ac.abort();

    await assert.rejects(promise, Error);

    const cache = await axios.storage.get(id);
    assert.notEqual(cache.state, 'loading');
    assert.equal(cache.state, 'empty');
  });

  it('Response interceptor handles non response errors', async () => {
    const instance = Axios.create();

    const NOT_RESPONSE = { notAResponse: true };

    //@ts-expect-error - this is indeed wrongly behavior
    instance.interceptors.response.use(() => NOT_RESPONSE);

    const axios = mockAxios(undefined, undefined, instance);

    await assert.rejects(
      // just calls the response interceptor
      axios.get('url'),
      NOT_RESPONSE
    );
  });

  it('Works when modifying response', async () => {
    const axios = mockAxios();

    // fresh response from server and transformed
    const freshResponse = await axios.get('url', {
      transformResponse: (data: unknown) => [data]
    });

    // cached response
    // should not transform again as already in desired format
    const cachedResponse = await axios.get('url', {
      transformResponse: (data: unknown) => [data]
    });

    assert.deepEqual(freshResponse.data, [true]);
    assert.deepEqual(cachedResponse.data, [true]);
  });

  it('Works when modifying the error response', async () => {
    const axios = mockAxios();
    const error = new Error();

    const promise = axios.get('url', {
      transformResponse: () => {
        throw error;
      }
    });

    await assert.rejects(promise, error);
  });

  it('Cancelled deferred still should save cache after new response', async () => {
    const axios = mockAxios();

    const id = '1';
    const controller = new AbortController();

    const cancelled = axios.get('url', { id, signal: controller.signal });
    const promise = axios.get('url', { id });

    controller.abort();

    // p1 should fail as it was aborted
    try {
      await cancelled;
      assert.fail('should have thrown an error');
    } catch (error: any) {
      assert.equal(error.code, 'ERR_CANCELED');
    }

    const response = await promise;

    // p2 should succeed as it was not aborted
    await assert.ok(response.data);
    await assert.equal(response.cached, false);
    assert.equal(response.stale, undefined);

    const storage = await axios.storage.get(id);

    // P2 should have saved the cache
    // even that his origin was from a cancelled deferred
    assert.equal(storage.state, 'cached');
    assert.equal(storage.data?.data, true);
  });

  it('Response gets cached even if there is a pending request without deferred.', async () => {
    const axios = mockAxios();

    const id = '1';

    // Simulates previous unresolved request
    await axios.storage.set(id, {
      state: 'loading',
      previous: 'empty'
    });

    const response = await axios.get('url', { id });

    assert.equal(response.cached, false);
    assert.equal(response.stale, undefined);
    assert.ok(response.data);

    const storage = await axios.storage.get(id);

    assert.equal(storage.state, 'cached');
    assert.equal(storage.data?.data, true);
  });
});
