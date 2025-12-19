import assert from 'node:assert';
import { describe, it } from 'node:test';
import Axios, { AxiosError } from 'axios';
import { setupCache } from '../../src/cache/create.js';

describe('Concurrent Request Error Handling', () => {
  it('All deduplicated requests should fail when first request fails with 4xx', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    let requestCount = 0;

    // Mock adapter that fails with 404 on first request
    axios.defaults.adapter = async (config) => {
      requestCount++;

      throw new AxiosError(
        'Not Found',
        '404',
        config,
        { config },
        {
          data: { error: 'Not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
          request: { config }
        }
      );
    };

    // Fire 10 concurrent requests
    const requests = Array.from({ length: 10 }, () => axios.get('http://test.com/resource'));

    // All requests should fail
    const results = await Promise.allSettled(requests);

    // All should be rejected
    for (const result of results) {
      assert.equal(result.status, 'rejected');
      if (result.status === 'rejected') {
        assert.ok(result.reason.isAxiosError);
        assert.equal(result.reason.response?.status, 404);
      }
    }

    // Only ONE network request should have been made (deduplication working)
    assert.equal(requestCount, 1, 'Expected only 1 network request due to deduplication');
  });

  it('All deduplicated requests should fail when first request fails with 400', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    let requestCount = 0;

    // Mock adapter that fails with 400 on first request
    axios.defaults.adapter = async (config) => {
      requestCount++;

      throw new AxiosError(
        'Bad Request',
        '400',
        config,
        { config },
        {
          data: { error: 'Bad request' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config,
          request: { config }
        }
      );
    };

    // Fire 100 concurrent requests to simulate the issue scenario
    const requests = Array.from({ length: 100 }, () => axios.get('http://test.com/resource'));

    // All requests should fail
    const results = await Promise.allSettled(requests);

    // All should be rejected
    for (const result of results) {
      assert.equal(result.status, 'rejected');
      if (result.status === 'rejected') {
        assert.ok(result.reason.isAxiosError);
        assert.equal(result.reason.response?.status, 400);
      }
    }

    // Only ONE network request should have been made (deduplication working)
    assert.equal(requestCount, 1, 'Expected only 1 network request due to deduplication');
  });

  it('All deduplicated requests should fail when first request fails with network error', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    let requestCount = 0;

    // Mock adapter that fails with network error
    axios.defaults.adapter = async (config) => {
      requestCount++;

      throw new AxiosError('Network Error', 'ERR_NETWORK', config, { config });
    };

    // Fire 10 concurrent requests
    const requests = Array.from({ length: 10 }, () => axios.get('http://test.com/resource'));

    // All requests should fail
    const results = await Promise.allSettled(requests);

    // All should be rejected
    for (const result of results) {
      assert.equal(result.status, 'rejected');
      if (result.status === 'rejected') {
        assert.ok(result.reason.isAxiosError);
        assert.equal(result.reason.code, 'ERR_NETWORK');
      }
    }

    // Only ONE network request should have been made (deduplication working)
    assert.equal(requestCount, 1, 'Expected only 1 network request due to deduplication');
  });

  it('Subsequent requests after failed deduplicated request should retry', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    let requestCount = 0;

    // Mock adapter that always fails
    axios.defaults.adapter = async (config) => {
      requestCount++;

      throw new AxiosError(
        'Not Found',
        '404',
        config,
        { config },
        {
          data: { error: 'Not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
          request: { config }
        }
      );
    };

    // First batch of concurrent requests
    const batch1 = Array.from({ length: 5 }, () => axios.get('http://test.com/resource'));

    await Promise.allSettled(batch1);

    const requestCountAfterBatch1 = requestCount;
    assert.equal(requestCountAfterBatch1, 1, 'First batch should make 1 request');

    // Second batch after first failed - should retry with new request
    const batch2 = Array.from({ length: 5 }, () => axios.get('http://test.com/resource'));

    await Promise.allSettled(batch2);

    // Second batch should also make only 1 request (deduplicated among themselves)
    assert.equal(requestCount, 2, 'Second batch should make 1 additional request');
  });
});
