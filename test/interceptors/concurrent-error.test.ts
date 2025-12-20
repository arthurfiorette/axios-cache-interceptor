import assert from 'node:assert';
import { describe, it } from 'node:test';
import Axios, { AxiosError } from 'axios';
import type { InternalCacheRequestConfig } from '../../src/cache/axios.js';
import { setupCache } from '../../src/cache/create.js';

/**
 * Helper function to create a mock adapter that always throws an AxiosError
 */
function createErrorAdapter(
  statusCode: number,
  statusText: string,
  errorCode?: string,
  onRequest?: () => void
) {
  return async (config: InternalCacheRequestConfig) => {
    onRequest?.();

    const error = new AxiosError(
      statusText,
      errorCode || statusCode.toString(),
      config,
      { config },
      errorCode
        ? undefined
        : {
            data: { error: statusText },
            status: statusCode,
            statusText,
            headers: {},
            config,
            request: { config }
          }
    );

    throw error;
  };
}

describe('Concurrent Request Error Handling', () => {
  it('All deduplicated requests should fail when first request fails with 4xx', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    let requestCount = 0;

    // Mock adapter that fails with 404
    axios.defaults.adapter = createErrorAdapter(404, 'Not Found', undefined, () => {
      requestCount++;
    });

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

    // Mock adapter that fails with 400
    axios.defaults.adapter = createErrorAdapter(400, 'Bad Request', undefined, () => {
      requestCount++;
    });

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
    axios.defaults.adapter = createErrorAdapter(0, 'Network Error', 'ERR_NETWORK', () => {
      requestCount++;
    });

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
    axios.defaults.adapter = createErrorAdapter(404, 'Not Found', undefined, () => {
      requestCount++;
    });

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
