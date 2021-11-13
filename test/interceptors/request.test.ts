import { CacheRequestInterceptor } from '../../src/interceptors/request';
import { mockAxios } from '../mocks/axios';
import { sleep } from '../utils';

describe('test request interceptor', () => {
  it('tests against specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const response = await axios.get('');
    const cacheKey = await axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('empty');
  });

  it('tests specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const response = await axios.get('');
    const cacheKey = await axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('cached');
  });

  it('tests concurrent requests', async () => {
    const axios = mockAxios();

    const [resp1, resp2] = await Promise.all([axios.get(''), axios.get('')]);

    expect(resp1.cached).toBe(false);
    expect(resp2.cached).toBe(true);
  });

  it('tests concurrent requests with cache: false', async () => {
    const axios = mockAxios();

    const results = await Promise.all([
      axios.get('', { cache: false }),
      axios.get(''),
      axios.get('', { cache: false })
    ]);
    for (const result of results) {
      expect(result.cached).toBe(false);
    }
  });

  /**
   * This is to test when two requests are made simultaneously. With
   * that, the second response waits the deferred from the first one.
   * Because the first request is not cached, the second should not be
   * waiting forever for the deferred to be resolved with a cached response.
   */
  it('tests concurrent requests with uncached responses', async () => {
    const axios = mockAxios();

    const [, resp2] = await Promise.all([
      axios.get('', {
        // Simple predicate to ignore cache in the response step.
        cache: { cachePredicate: () => false }
      }),
      axios.get('')
    ]);

    expect(resp2.cached).toBe(false);
  });

  it('tests response.cached', async () => {
    const axios = mockAxios();

    const response = await axios.get('');
    expect(response.cached).toBe(false);

    const response2 = await axios.get('');
    expect(response2.cached).toBe(true);

    const response3 = await axios.get('', { id: 'random-id' });
    expect(response3.cached).toBe(false);

    const response4 = await axios.get('', { id: 'random-id' });
    expect(response4.cached).toBe(true);
  });

  it('test cache expiration', async () => {
    const axios = mockAxios({}, { 'cache-control': 'max-age=1' });

    await axios.get('', { cache: { interpretHeader: true } });

    const resultCache = await axios.get('');
    expect(resultCache.cached).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('');
    expect(response2.cached).toBe(false);
  });

  it('tests etag handling', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'max-age=1' });
    const config = { cache: { interpretHeader: true, etag: true } };

    // initial request
    await axios.get('', config);

    const response = await axios.get('', config);
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('', config);
    // from revalidation
    expect(response2.cached).toBe(true);
    // ensure value from stale cache is kept
    expect(response2.data).toBe(true);
  });

  it('tests last modified header handling', async () => {
    const axios = mockAxios(
      {},
      {
        'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
        'cache-control': 'max-age=1'
      }
    );

    const config = { cache: { interpretHeader: true, modifiedSince: true } };

    await axios.get('', config);

    const response = await axios.get('', config);
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('', config);
    // from revalidation
    expect(response2.cached).toBe(true);
    expect(response2.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('tests must revalidate handling without any headers to do so', async () => {
    const axios = mockAxios({}, { 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true } };
    await axios.get('', config);

    await sleep(2); // 1ms cache

    const response = await axios.get('', config);
    expect(response.cached).toBe(false); // nothing to use for revalidation
  });

  it('tests must revalidate handling with etag', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true, etag: true } };

    await axios.get('', config);

    // 1ms cache
    await sleep(2);

    const response = await axios.get('', config);
    // from etag revalidation
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);
  });

  it('tests must revalidate handling with etag custom e-tag', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true, etag: 'fakeEtag' } };

    await axios.get('', config);

    // 1ms cache
    await sleep(2);

    const response = await axios.get('', config);
    // from etag revalidation
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);
  });

  it('tests validate-status function', async () => {
    const { createValidateStatus } = CacheRequestInterceptor;

    const def = createValidateStatus();
    expect(def(200)).toBe(true);
    expect(def(345)).toBe(false);
    expect(def(304)).toBe(true);

    const only200 = createValidateStatus((s) => s >= 200 && s < 300);
    expect(only200(200)).toBe(true);
    expect(only200(299)).toBe(true);
    expect(only200(304)).toBe(true);
    expect(only200(345)).toBe(false);

    const randomValue = createValidateStatus((s) => s >= 405 && s <= 410);
    expect(randomValue(200)).toBe(false);
    expect(randomValue(404)).toBe(false);
    expect(randomValue(405)).toBe(true);
    expect(randomValue(304)).toBe(true);
  });
});
