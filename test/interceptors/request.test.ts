import { StatusCodes } from '../../src';
import { axiosMock, mockAxios } from '../mocks/axios';

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

    expect(resp1.status).toBe(axiosMock.statusCode);
    expect(resp1.statusText).toBe(axiosMock.statusText);
    expect(resp2.status).toBe(StatusCodes.CACHED_STATUS_CODE);
    expect(resp2.statusText).toBe(StatusCodes.CACHED_STATUS_TEXT);
  });

  it('tests concurrent requests with cache: false', async () => {
    const axios = mockAxios();

    const results = await Promise.all([
      axios.get('', { cache: false }),
      axios.get(''),
      axios.get('', { cache: false })
    ]);
    for (const result of results) {
      expect(result.status).toBe(axiosMock.statusCode);
      expect(result.statusText).toBe(axiosMock.statusText);
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

    expect(resp2.status).toBe(axiosMock.statusCode);
    expect(resp2.statusText).toBe(axiosMock.statusText);
  });
});
