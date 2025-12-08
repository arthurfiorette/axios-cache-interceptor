import assert from 'node:assert';
import { describe, it } from 'node:test';
import { mockAxios } from '../mocks/axios.js';

describe('Cache Enabled Flag', () => {
  it('Cache enabled by default (enabled: true)', async () => {
    const axios = mockAxios();

    const response1 = await axios.get('http://test.com');
    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);

    const response2 = await axios.get('http://test.com');
    assert.ok(response2.cached);
    assert.equal(response2.stale, false);
  });

  it('Global cache disabled (enabled: false)', async () => {
    const axios = mockAxios({ enabled: false });

    const response1 = await axios.get('http://test.com');
    const response2 = await axios.get('http://test.com');

    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);
    assert.equal(response2.cached, false);
    assert.equal(response2.stale, undefined);

    // Verify cache is empty
    const cacheKey = axios.generateKey(response1.config);
    const cache = await axios.storage.get(cacheKey);
    assert.equal(cache.state, 'empty');
  });

  it('Global cache disabled, per-request enabled', async () => {
    const axios = mockAxios({ enabled: false });

    // First request with cache enabled
    const response1 = await axios.get('http://test.com', {
      cache: { enabled: true }
    });
    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);

    // Second request with cache enabled - should be cached
    const response2 = await axios.get('http://test.com', {
      cache: { enabled: true }
    });
    assert.ok(response2.cached);
    assert.equal(response2.stale, false);

    // Third request without cache config - should not be cached (global default)
    const response3 = await axios.get('http://test.com/other');
    const response4 = await axios.get('http://test.com/other');

    assert.equal(response3.cached, false);
    assert.equal(response3.stale, undefined);
    assert.equal(response4.cached, false);
    assert.equal(response4.stale, undefined);
  });

  it('Global cache enabled, per-request disabled', async () => {
    const axios = mockAxios({ enabled: true });

    // First request with cache disabled
    const response1 = await axios.get('http://test.com', {
      cache: { enabled: false }
    });
    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);

    // Second request with cache disabled - should not be cached
    const response2 = await axios.get('http://test.com', {
      cache: { enabled: false }
    });
    assert.equal(response2.cached, false);
    assert.equal(response2.stale, undefined);

    // Third request without cache config - should be cached (global default)
    const response3 = await axios.get('http://test.com/other');
    const response4 = await axios.get('http://test.com/other');

    assert.equal(response3.cached, false);
    assert.equal(response3.stale, undefined);
    assert.ok(response4.cached);
    assert.equal(response4.stale, false);
  });

  it('Backward compatibility: cache: false still works', async () => {
    const axios = mockAxios();

    const response1 = await axios.get('http://test.com', { cache: false });
    const response2 = await axios.get('http://test.com', { cache: false });

    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);
    assert.equal(response2.cached, false);
    assert.equal(response2.stale, undefined);

    // Verify cache is empty
    const cacheKey = axios.generateKey(response1.config);
    const cache = await axios.storage.get(cacheKey);
    assert.equal(cache.state, 'empty');
  });

  it('Enabled flag works with other cache options', async () => {
    const axios = mockAxios({ enabled: false });

    const response1 = await axios.get('http://test.com', {
      cache: {
        enabled: true,
        ttl: 1000 * 60 * 10 // 10 minutes
      }
    });
    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);

    const response2 = await axios.get('http://test.com', {
      cache: {
        enabled: true,
        ttl: 1000 * 60 * 10
      }
    });
    assert.ok(response2.cached);
    assert.equal(response2.stale, false);

    // Verify cache config is applied
    assert.equal(response2.config.cache?.ttl, 1000 * 60 * 10);
  });

  it('Enabled flag overrides in request after global enabled', async () => {
    const axios = mockAxios({ enabled: true });

    // Request 1 with enabled: true (explicit)
    const response1 = await axios.get('http://test.com', {
      cache: { enabled: true }
    });
    assert.equal(response1.cached, false);
    assert.equal(response1.stale, undefined);

    // Request 2 - should be cached
    const response2 = await axios.get('http://test.com');
    assert.ok(response2.cached);
    assert.equal(response2.stale, false);

    // Request 3 with enabled: false - should not be cached even though cache exists
    const response3 = await axios.get('http://test.com', {
      cache: { enabled: false }
    });
    assert.equal(response3.cached, false);
    assert.equal(response3.stale, undefined);
  });

  it('Concurrent requests respect enabled flag', async () => {
    const axios = mockAxios({ enabled: false });

    const [resp1, resp2] = await Promise.all([
      axios.get('http://test.com', { cache: { enabled: true } }),
      axios.get('http://test.com', { cache: { enabled: true } })
    ]);

    assert.equal(resp1.cached, false);
    assert.equal(resp1.stale, undefined);
    assert.ok(resp2.cached);
    assert.equal(resp2.stale, false);
  });

  it('Mixed enabled and disabled requests do not interfere', async () => {
    const axios = mockAxios({ enabled: false });

    // Disabled request
    const resp1 = await axios.get('http://test.com');
    assert.equal(resp1.cached, false);

    // Enabled request - creates cache
    const resp2 = await axios.get('http://test.com', {
      cache: { enabled: true }
    });
    assert.equal(resp2.cached, false);

    // Disabled request - does not use cache
    const resp3 = await axios.get('http://test.com');
    assert.equal(resp3.cached, false);

    // Enabled request - uses cache
    const resp4 = await axios.get('http://test.com', {
      cache: { enabled: true }
    });
    assert.ok(resp4.cached);
  });
});
