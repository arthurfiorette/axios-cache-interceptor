import assert from 'node:assert';
import { describe, it } from 'node:test';
import Axios, { AxiosError } from 'axios';
import { setupCache } from '../../src/cache/create.js';
import { Header } from '../../src/header/headers.js';
import { mockAxios } from '../mocks/axios.js';
import { mockDateNow } from '../utils.js';

describe('StaleIfError handling', () => {
  it('Handles thrown errors', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }

    axios.defaults.cache.staleIfError = 10e5;

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }

    axios.defaults.cache.staleIfError = true;

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }
  });

  it('StaleIfError does nothing without cache', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => Promise.resolve(true)
    });

    try {
      await axios.get('http://unknown.url.lan:1234');
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }
  });

  it('staleIfError works without x-axios-cache header', async () => {
    const axios = mockAxios({
      ttl: 127910 // random number
    });

    const response = await axios.get('url', {
      cache: { staleIfError: true }
    });

    // Verify cache entry exists and can be used for stale-if-error
    const cache = await axios.storage.get(response.id);
    assert.equal(cache.state, 'cached');
    assert.equal(cache.ttl, 127910);
  });

  it('StaleIfError is `ignore` if `config.cache=false`', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: false
      });
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }
  });

  it('StaleIfError', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('http://unknown-url.lan:9090', {
      id,
      cache: { staleIfError: true }
    });

    assert.ok(response);
    assert.equal(response.id, id);
    assert.equal(response.data, cache.data);
    assert.equal(response.status, cache.status);
    assert.equal(response.statusText, cache.statusText);
    assert.strictEqual(response.headers, cache.headers);
    assert.ok(response.cached);
    assert.ok(response.stale);
  });

  it('StaleIfError needs to be `true`', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: { staleIfError: false }
      });
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }
  });

  it('StaleIfError returning `false`', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => false
    });

    const id = 'some-config-id';
    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', { id });
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }
  });

  it('StaleIfError as function', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => {
        return Promise.resolve(false);
      }
    });

    const id = 'some-config-id';

    try {
      await axios.get('http://unknown-url.lan:9090', { id });
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: {
          staleIfError: () => 1 // past
        }
      });
      assert.fail('should have thrown an error');
    } catch (error) {
      assert.ok(Axios.isAxiosError(error));
    }

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('http://unknown-url.lan:9090', {
      id,
      cache: {
        staleIfError: () => 10e5 // nearly infinity :)
      }
    });

    assert.ok(response);
    assert.equal(response.id, id);
    assert.equal(response.data, cache.data);
    assert.equal(response.status, cache.status);
    assert.equal(response.statusText, cache.statusText);
    assert.deepEqual(response.headers, cache.headers);
    assert.ok(response.cached);
    assert.ok(response.stale);
  });

  it('StaleIfError with real 50X status code', async () => {
    const axios = setupCache(Axios.create(), { staleIfError: true });

    const id = 'some-config-id';

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('url', {
      id,
      adapter: (config) =>
        Promise.reject({
          isAxiosError: true,
          data: false,
          headers: {},
          config,
          status: 503,
          statusText: 'Service Unavailable'
        })
    });

    assert.ok(response);
    assert.equal(response.id, id);
    assert.equal(response.data, cache.data);
    assert.equal(response.status, cache.status);
    assert.equal(response.statusText, cache.statusText);
    assert.deepEqual(response.headers, cache.headers);
    assert.ok(response.cached);
    assert.ok(response.stale);

    const newResponse = await axios.get('url', {
      id,
      validateStatus: () => true, // prevents error
      adapter: (config) =>
        Promise.resolve({
          data: false,
          headers: {},
          config,
          status: 503,
          statusText: 'Service Unavailable'
        })
    });

    assert.ok(newResponse);
    assert.equal(newResponse.id, id);
    assert.notEqual(newResponse.data, cache.data);
    assert.equal(newResponse.status, 503);
  });

  it('Cache is marked as stale', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const id = 'some-config-id';
    const cacheData = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cacheData
    });

    const [res1, res2] = await Promise.all([
      axios.get('http://unknown-url.lan:9090', {
        id
      }),
      axios.get('http://unknown-url.lan:9090', {
        id
      })
    ]);

    assert.ok(res1);
    assert.ok(res2);
    assert.equal(res1.id, id);
    assert.equal(res2.id, id);
    assert.equal(res1.data, cacheData.data);
    assert.equal(res2.data, cacheData.data);
    assert.equal(res1.status, cacheData.status);
    assert.equal(res2.status, cacheData.status);
    assert.equal(res1.statusText, cacheData.statusText);
    assert.equal(res2.statusText, cacheData.statusText);

    // res1 and res2.headers are instance of AxiosHeaders
    // and cacheData.headers is a plain object.
    assert.deepEqual(Object.assign({}, res1.headers), cacheData.headers);
    assert.deepEqual(Object.assign({}, res2.headers), cacheData.headers);

    assert.ok(res1.cached);
    assert.ok(res2.cached);
    assert.ok(res1.stale);
    assert.ok(res2.stale);

    const cache = await axios.storage.get(id);

    assert.equal(cache.state, 'stale');
    assert.equal(typeof cache.createdAt, 'number');
    assert.strictEqual(cache.data, cacheData);
  });

  it('Future cache is marked as stale', async () => {
    const axios = mockAxios(
      {},
      {
        [Header.CacheControl]: 'stale-if-error=1'
      }
    );

    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: {
        data: true,
        headers: {},
        status: 200,
        statusText: 'Ok'
      }
    });

    const response = await axios.get('url', {
      id,
      cache: { staleIfError: true },
      validateStatus: () => false
    });

    assert.ok(response);
    assert.equal(response.id, id);
    assert.ok(response.cached);
    assert.ok(response.stale);
    assert.ok(response.data);

    // Advances on time
    mockDateNow(2e9);

    try {
      await axios.get('url', {
        id,
        cache: { staleIfError: true },
        validateStatus: () => false
      });
      assert.fail('should have thrown an error');
    } catch (error: any) {
      assert.deepEqual(error.config.id, id);
    }
  });

  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/685
  it('ensure failed responses always cleans up waiting promise', async () => {
    const axios = mockAxios({ staleIfError: false, ttl: -1 });

    axios.defaults.adapter = async (config) => {
      if (config.params?.fail) {
        throw new AxiosError(
          'Request failed with status code 404',
          'ERR_BAD_REQUEST',
          config,
          { config },
          { config, data: true, headers: {}, status: 404, statusText: 'Not Found' }
        );
      }

      return {
        config,
        data: true,
        headers: {},
        request: { config },
        status: 200,
        statusText: 'OK'
      };
    };

    const id = 'arthurfiorette/axios-cache-interceptor#685';

    const data = await axios.get('url', { id });

    assert.equal(data.cached, false);
    assert.equal(data.stale, undefined);

    try {
      await axios.get('url', { id, params: { fail: true } });
      assert.fail('should have thrown an error');
    } catch (error: any) {
      assert.equal(error.response.status, 404);
    }

    // If any waiting promise is not cleaned up, this will throw
    // `Promise resolution is still pending but the event loop has already resolved`
    // in node test runner
    try {
      await axios.get('url', { id, params: { fail: true } });
      assert.fail('should have thrown an error');
    } catch (error: any) {
      assert.equal(error.response.status, 404);
    }
  });
});
