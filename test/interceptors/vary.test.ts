import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers.js';
import { buildMemoryStorage } from '../../src/index.js';
import { mockAxios } from '../mocks/axios.js';

describe('Vary Header Support', () => {
  it('caches when vary headers match (sequential)', async () => {
    const axios = mockAxios({}, { [Header.Vary]: 'Authorization' });

    const resp1 = await axios.get('url', { headers: { authorization: 'Bearer A' } });
    const resp2 = await axios.get('url', { headers: { authorization: 'Bearer A' } });

    assert.equal(resp1.cached, false);
    assert.ok(resp2.cached);
    assert.equal(resp1.data, resp2.data);
  });

  it('handles Vary: * by storing as stale', async () => {
    const axios = mockAxios({}, { [Header.Vary]: '*' });

    const resp1 = await axios.get('url');
    const cache1 = await axios.storage.get(resp1.id);

    assert.equal(cache1.state, 'stale');

    const resp2 = await axios.get('url');
    assert.equal(resp2.cached, false); // Always revalidates
  });

  it('handles multiple vary headers', async () => {
    const axios = mockAxios({}, { [Header.Vary]: 'Authorization, Accept-Language' });

    const resp1 = await axios.get('url', {
      headers: { authorization: 'Bearer A', 'accept-language': 'en' }
    });

    const resp2 = await axios.get('url', {
      headers: { authorization: 'Bearer A', 'accept-language': 'en' }
    });

    const resp3 = await axios.get('url', {
      headers: { authorization: 'Bearer A', 'accept-language': 'fr' }
    });

    assert.equal(resp1.cached, false);
    assert.ok(resp2.cached); // Same vary = cache hit
    assert.equal(resp3.cached, false); // Different language = miss
  });

  it('9 concurrent: 3 variations x 3 requests = 3 network calls', async () => {
    let networkCallCount = 0;
    const callTimings: number[] = [];

    const storage = buildMemoryStorage();
    const axios = mockAxios({ storage }, { [Header.Vary]: 'Authorization' }, undefined, () => {
      networkCallCount++;
      callTimings.push(Date.now());
      return { user: Math.random(), call: networkCallCount, timestamp: Date.now() };
    });

    // 9 concurrent requests: 3 variations, 3 requests each
    const requests = [
      // 3 with Bearer A
      axios.get('url', { headers: { authorization: 'Bearer A' } }),
      axios.get('url', { headers: { authorization: 'Bearer A' } }),
      axios.get('url', { headers: { authorization: 'Bearer A' } }),

      // 3 with Bearer B
      axios.get('url', { headers: { authorization: 'Bearer B' } }),
      axios.get('url', { headers: { authorization: 'Bearer B' } }),
      axios.get('url', { headers: { authorization: 'Bearer B' } }),

      // 3 with Bearer C
      axios.get('url', { headers: { authorization: 'Bearer C' } }),
      axios.get('url', { headers: { authorization: 'Bearer C' } }),
      axios.get('url', { headers: { authorization: 'Bearer C' } })
    ];

    const responses = await Promise.all(requests);

    // Only 3 network calls (one per variation)
    assert.equal(networkCallCount, 3, 'Should make exactly 3 network calls');

    // Each group shares data (proper deduplication)
    assert.equal(responses[0]!.data.call, responses[1]!.data.call, 'Bearer A deduplication');
    assert.equal(responses[1]!.data.call, responses[2]!.data.call, 'Bearer A deduplication');

    assert.equal(responses[3]!.data.call, responses[4]!.data.call, 'Bearer B deduplication');
    assert.equal(responses[4]!.data.call, responses[5]!.data.call, 'Bearer B deduplication');

    assert.equal(responses[6]!.data.call, responses[7]!.data.call, 'Bearer C deduplication');
    assert.equal(responses[7]!.data.call, responses[8]!.data.call, 'Bearer C deduplication');

    // Different variations have different data
    assert.notEqual(responses[0]!.data.call, responses[3]!.data.call, 'A != B');
    assert.notEqual(responses[3]!.data.call, responses[6]!.data.call, 'B != C');

    // Should have exactly 3 cache entries (one per variation)
    assert.equal(storage.data?.size, 3, 'Should have 3 separate cache entries');

    // Verify each response ID is cached
    for (const resp of responses) {
      const cache = await storage.get(resp.id);
      assert.equal(cache.state, 'cached', `Response ${resp.id} should be cached`);
    }
  });

  it('pre-configured vary prevents first-request wait', async () => {
    let networkCallCount = 0;

    const axios = mockAxios(
      { vary: ['authorization'] },
      { [Header.Vary]: 'Authorization' },
      undefined,
      () => {
        networkCallCount++;
        return { call: networkCallCount };
      }
    );

    // With pre-configured vary, all requests include vary in initial key
    // So they don't wait on wrong deferred
    const [respA1, respA2, respB1, respB2] = await Promise.all([
      axios.get('url', { headers: { authorization: 'Bearer A' } }),
      axios.get('url', { headers: { authorization: 'Bearer A' } }),
      axios.get('url', { headers: { authorization: 'Bearer B' } }),
      axios.get('url', { headers: { authorization: 'Bearer B' } })
    ]);

    // Only 2 network calls (one per variation, no waiting on wrong deferred)
    assert.equal(networkCallCount, 2);

    // Same auth deduplicated
    assert.equal(respA1.data.call, respA2.data.call);
    assert.equal(respB1.data.call, respB2.data.call);

    // Different auth have different data
    assert.notEqual(respA1.data.call, respB1.data.call);
  });

  it('disables vary checking when vary: false', async () => {
    const axios = mockAxios({ vary: false }, { [Header.Vary]: 'Authorization' }, undefined, () => ({
      user: Math.random()
    }));

    const respA = await axios.get('url', { headers: { authorization: 'Bearer A' } });
    const respB = await axios.get('url', { headers: { authorization: 'Bearer B' } });

    // Vary disabled - User B gets User A's cached data (cache poisoning accepted)
    assert.equal(respA.cached, false);
    assert.ok(respB.cached);
    assert.equal(respA.data.user, respB.data.user); // Same data!
  });

  it('stores meta.vary with request header values', async () => {
    const axios = mockAxios({}, { [Header.Vary]: 'Authorization' });

    const resp = await axios.get('url', { headers: { authorization: 'Bearer X' } });
    const cache = await axios.storage.get(resp.id);

    assert.equal(cache.state, 'cached');
    assert.ok(cache.data?.meta?.vary);
    assert.equal(cache.data.meta.vary.authorization, 'Bearer X');
  });
});
