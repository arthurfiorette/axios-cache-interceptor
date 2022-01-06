import { Header } from '../../src/util/headers';
import { mockAxios, XMockRandom } from '../mocks/axios';

describe('test request interceptor', () => {
  it('tests cache predicate integration', async () => {
    const axios = mockAxios();

    const fetch = () =>
      axios.get('', {
        cache: {
          cachePredicate: {
            responseMatch: () => false
          }
        }
      });

    // Make first request to cache it
    await fetch();
    const result = await fetch();

    expect(result.cached).toBe(false);
  });

  it('tests header interpreter integration', async () => {
    const axiosNoCache = mockAxios({}, { [Header.CacheControl]: 'no-cache' });

    // Make first request to cache it
    await axiosNoCache.get('', { cache: { interpretHeader: true } });
    const resultNoCache = await axiosNoCache.get('');

    expect(resultNoCache.cached).toBe(false);

    const axiosCache = mockAxios(
      {},
      { [Header.CacheControl]: `max-age=${60 * 60 * 24 * 365}` }
    );

    // Make first request to cache it
    await axiosCache.get('', { cache: { interpretHeader: true } });
    const resultCache = await axiosCache.get('');

    expect(resultCache.cached).toBe(true);
  });

  it('tests update cache integration', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('key01');

    await axios.get('key02', {
      cache: {
        update: {
          [id]: 'delete' as const
        }
      }
    });

    const cache = await axios.storage.get(id);

    expect(cache.state).toBe('empty');
  });

  it('tests with blank cache-control header', async () => {
    const defaultTtl = 60;

    const axios = mockAxios(
      { ttl: defaultTtl, interpretHeader: true },
      { [Header.CacheControl]: '' }
    );

    const { id } = await axios.get('key01', {
      cache: {
        interpretHeader: true
      }
    });

    const cache = await axios.storage.get(id);

    expect(cache.state).toBe('cached');
    expect(cache.ttl).toBe(defaultTtl);
  });

  it('tests ttl with functions', async () => {
    const axios = mockAxios();
    const id = 'my-id';

    // first request (cached by tll)

    await axios.get('url', {
      id,
      cache: {
        ttl: (resp) => {
          expect(resp.cached).toBe(false);
          expect(resp.config).toBeDefined();
          expect(resp.headers[XMockRandom]).not.toBeNaN();
          expect(resp.status).toBe(200);
          expect(resp.statusText).toBe('200 OK');
          expect(resp.data).toBeTruthy();

          return 100;
        }
      }
    });

    const cache1 = await axios.storage.get(id);
    expect(cache1.state).toBe('cached');
    expect(cache1.ttl).toBe(100);

    // Second request (cached by ttl)

    const ttl = jest.fn().mockReturnValue(200);

    await axios.get('url', {
      id,
      cache: { ttl }
    });

    const cache2 = await axios.storage.get(id);
    expect(cache2.state).toBe('cached');
    expect(cache2.ttl).toBe(100);

    expect(ttl).not.toHaveBeenCalled();

    // Force invalidation
    await axios.storage.remove(id);
  });

  it('tests async ttl function', async () => {
    const axios = mockAxios();

    // A lot of promises and callbacks
    const { id } = await axios.get('url', {
      cache: {
        ttl: async () => {
          await 0;

          return new Promise((res) => {
            setTimeout(() => {
              process.nextTick(() => {
                res(173);
              });
            }, 50);
          });
        }
      }
    });

    const cache = await axios.storage.get(id);
    expect(cache.state).toBe('cached');
    expect(cache.ttl).toBe(173);
  });

  it('ensures that a request id has been generated even with cache: false', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('url', { cache: false });

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });
});
