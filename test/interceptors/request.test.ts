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
    const axios = mockAxios({}, { 'cache-control': 'max-age=1' });

    await axios.get('http://test.com', { cache: { interpretHeader: true } });

    const resultCache = await axios.get('http://test.com');
    expect(resultCache.cached).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('http://test.com');
    expect(response2.cached).toBe(false);
  });

  it('tests "must revalidate" handling without any headers to do so', async () => {
    const axios = mockAxios({}, { 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true } };
    await axios.get('http://test.com', config);

    // 0ms cache
    await sleep(1);

    const response = await axios.get('http://test.com', config);
    // nothing to use for revalidation
    expect(response.cached).toBe(false);
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
});
