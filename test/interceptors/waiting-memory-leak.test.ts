import assert from 'node:assert';
import { describe, it } from 'node:test';
import { buildMemoryStorage } from '../../src/storage/memory.js';
import { mockAxios } from '../mocks/axios.js';

describe('Waiting Memory Leak', () => {
  it('should clean up waiting map when entry is evicted from storage due to maxEntries', async () => {
    // Create storage with maxEntries=2 to force eviction
    const storage = buildMemoryStorage(false, false, 2);
    const axios = mockAxios({ storage, waitingTimeout: 100 });

    // Make 3 concurrent requests to different URLs
    // The first request should be evicted when the third one starts
    const promise1 = axios.get('url1');
    const promise2 = axios.get('url2');
    const promise3 = axios.get('url3');

    // Wait for all requests to complete
    await Promise.all([promise1, promise2, promise3]);

    // Poll until waiting map is empty or timeout
    const startTime = Date.now();
    while (axios.waiting.size > 0 && Date.now() - startTime < 300) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // The waiting map should be empty after timeout cleanup
    assert.equal(axios.waiting.size, 0, 'waiting map should be empty after all requests complete');
  });

  it('should clean up waiting map when loading entry is evicted during concurrent requests', async () => {
    // Create storage with maxEntries=1 to force aggressive eviction
    const storage = buildMemoryStorage(false, false, 1);
    const axios = mockAxios({ storage, waitingTimeout: 100 });

    // Start two concurrent requests
    const promise1 = axios.get('url1');
    const promise2 = axios.get('url2');

    // Wait for both to complete
    const [result1, result2] = await Promise.all([promise1, promise2]);

    // Verify responses are valid
    assert.ok(result1.data);
    assert.ok(result2.data);

    // Poll until waiting map is empty or timeout
    const startTime = Date.now();
    while (axios.waiting.size > 0 && Date.now() - startTime < 300) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // The waiting map should be empty
    assert.equal(axios.waiting.size, 0, 'waiting map should be empty but has entries');
  });

  it('should handle multiple waves of concurrent requests with maxEntries', async () => {
    const storage = buildMemoryStorage(false, false, 2);
    const axios = mockAxios({ storage, waitingTimeout: 100 });

    // First wave of requests
    await Promise.all([axios.get('url1'), axios.get('url2'), axios.get('url3')]);

    // Poll until waiting map is empty or timeout
    let startTime = Date.now();
    while (axios.waiting.size > 0 && Date.now() - startTime < 300) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    assert.equal(axios.waiting.size, 0, 'waiting map should be empty after first wave');

    // Second wave of requests
    await Promise.all([axios.get('url4'), axios.get('url5'), axios.get('url6')]);

    // Poll until waiting map is empty or timeout
    startTime = Date.now();
    while (axios.waiting.size > 0 && Date.now() - startTime < 300) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    assert.equal(axios.waiting.size, 0, 'waiting map should be empty after second wave');
  });
});
