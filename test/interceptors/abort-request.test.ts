import assert from 'node:assert';
import { describe, it } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import Axios, { AxiosError } from 'axios';
import type { InternalCacheRequestConfig } from '../../src/cache/axios.js';
import { setupCache } from '../../src/cache/create.js';

describe('Aborted Request Handling', () => {
  it('Second request should succeed after first request is aborted', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {
      interpretHeader: false
    });

    let requestCount = 0;

    // Mock adapter that simulates a network request
    axios.defaults.adapter = async (config: InternalCacheRequestConfig) => {
      requestCount++;
      
      // Simulate network delay
      await setTimeout(100);

      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: { config }
      };
    };

    // Create an AbortController
    const abortController = new AbortController();

    // Start the first request with abort signal
    const req1Promise = axios.get('https://test.com/products', {
      signal: abortController.signal
    });

    // Abort the request after a short delay
    setTimeout(10).then(() => {
      abortController.abort();
    });

    // Wait for the abort to happen
    let req1Error: any;
    try {
      await req1Promise;
    } catch (error) {
      req1Error = error;
    }

    // First request should be aborted
    assert.ok(req1Error);
    assert.equal(req1Error.code, 'ERR_CANCELED');

    // Second request with same parameters should succeed
    const req2 = await axios.get('https://test.com/products');

    assert.equal(req2.data.success, true);
    assert.equal(req2.status, 200);
    
    // The second request should have made a network call since the first was aborted
    assert.equal(requestCount, 2);
  });

  it('Second request made immediately after aborting should succeed (issue reproduction)', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {
      interpretHeader: false,
      debug: (msg) => {
        // Uncomment to see debug logs like in the issue
        // console.log(JSON.stringify(msg, null, 2));
      }
    });

    let requestCount = 0;

    // Mock adapter that simulates a network request
    axios.defaults.adapter = async (config: InternalCacheRequestConfig) => {
      requestCount++;
      
      // Simulate network delay
      await setTimeout(50);

      return {
        data: { success: true, requestId: requestCount },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: { config }
      };
    };

    // Reproduce the exact scenario from the issue
    const abortController = new AbortController();
    const req1 = axios.get('https://dummyjson.com/products', {
      signal: abortController.signal
    });

    // After 10ms, abort the first request AND make the second request immediately
    // This is the key part - both happen in the same setTimeout
    const req2Promise = new Promise((resolve, reject) => {
      setTimeout(10).then(() => {
        abortController.abort();
        const req2 = axios.get('https://dummyjson.com/products');
        req2.then(resolve).catch(reject);
      });
    });

    // First request should fail with abort error
    await assert.rejects(req1, { code: 'ERR_CANCELED' });

    // Second request should succeed (this is where the bug would show)
    const req2 = await req2Promise;
    assert.equal(req2.data.success, true);
    assert.equal(req2.status, 200);
  });

  it('Multiple concurrent requests after aborted request should all succeed', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {
      interpretHeader: false
    });

    let requestCount = 0;

    // Mock adapter
    axios.defaults.adapter = async (config: InternalCacheRequestConfig) => {
      requestCount++;
      await setTimeout(100);

      return {
        data: { success: true, count: requestCount },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: { config }
      };
    };

    // First request with abort
    const abortController = new AbortController();
    const req1Promise = axios.get('https://test.com/api', {
      signal: abortController.signal
    });

    setTimeout(10).then(() => {
      abortController.abort();
    });

    await assert.rejects(req1Promise, { code: 'ERR_CANCELED' });

    // Make multiple concurrent requests after abort
    const [req2, req3, req4] = await Promise.all([
      axios.get('https://test.com/api'),
      axios.get('https://test.com/api'),
      axios.get('https://test.com/api')
    ]);

    // All should succeed
    assert.equal(req2.data.success, true);
    assert.equal(req3.data.success, true);
    assert.equal(req4.data.success, true);

    // First request was aborted (1 call)
    // Second batch should be deduplicated (1 call)
    // Total: 2 calls
    assert.equal(requestCount, 2);

    // The second and third should be cached from the second request
    assert.equal(req2.cached, false);
    assert.ok(req3.cached);
    assert.ok(req4.cached);
  });
});
