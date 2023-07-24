import Axios from 'axios';
import { setupCache } from '../../src/cache/create';
import { Header } from '../../src/header/headers';
import { mockAxios, XMockRandom } from '../mocks/axios';

describe('test response interceptor', () => {
  it('tests for storage.get call against specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const spy = jest.spyOn(axios.storage, 'get');
    await axios.get('http://test.com');

    expect(spy).not.toHaveBeenCalled();
  });

  it('tests for storage.get call with specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const spy = jest.spyOn(axios.storage, 'get');
    await axios.get('http://test.com');

    expect(spy).toHaveBeenCalled();
  });

  it('tests on error for storage.get call against specified methods', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});
    // only cache post methods
    axios.defaults.cache.methods = ['post'];

    expect.assertions(1);

    const spy = jest.spyOn(axios.storage, 'get');
    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('tests on error for storage.get call with specified methods', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});
    // only cache get methods
    axios.defaults.cache.methods = ['get'];

    expect.assertions(1);

    const spy = jest.spyOn(axios.storage, 'get');
    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(spy).toHaveBeenCalled();
    }
  });

  it('tests cache predicate integration', async () => {
    const axios = mockAxios();

    const fetch = () =>
      axios.get('http://test.com', {
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
    await axiosNoCache.get('http://test.com', { cache: { interpretHeader: true } });
    const resultNoCache = await axiosNoCache.get('http://test.com');

    expect(resultNoCache.cached).toBe(false);

    const axiosCache = mockAxios(
      {},
      { [Header.CacheControl]: `max-age=${60 * 60 * 24 * 365}` }
    );

    // Make first request to cache it
    await axiosCache.get('http://test.com', { cache: { interpretHeader: true } });
    const resultCache = await axiosCache.get('http://test.com');

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

  it('ensures that a request id has not been generated when cache: false', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('url', { cache: false });

    expect(id).not.toBeDefined();
  });

  it('ensures that a request id has been generated when cache is not false', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('url');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('It expects that any X-axios-cache gets removed', async () => {
    const headerValue = '23asdf8ghd';

    const axios = mockAxios(
      {},
      {
        [Header.XAxiosCacheEtag]: headerValue,
        [Header.XAxiosCacheLastModified]: headerValue,
        [Header.XAxiosCacheStaleIfError]: headerValue
      }
    );

    const { headers } = await axios.get('url');

    expect(headers[Header.XAxiosCacheEtag]).not.toBe(headerValue);
    expect(headers[Header.XAxiosCacheLastModified]).not.toBe(headerValue);
    expect(headers[Header.XAxiosCacheStaleIfError]).not.toBe(headerValue);
  });

  // https://github.com/arthurfiorette/axios-cache-interceptor/issues/317
  it('Expects that aborted requests clears its cache', async () => {
    const id = 'abort-request-id';
    const ac = new AbortController();
    const axios = mockAxios();

    const promise = axios.get('url', { id, signal: ac.signal });

    ac.abort();

    await expect(promise).rejects.toThrow(Error);

    const cache = await axios.storage.get(id);
    expect(cache.state).not.toBe('loading');
    expect(cache.state).toBe('empty');
  });

  it('expects response interceptor handles non response errors', async () => {
    const instance = Axios.create();

    const NOT_RESPONSE = { notAResponse: true };

    //@ts-expect-error - this is indeed wrongly behavior
    instance.interceptors.response.use(() => NOT_RESPONSE);

    const axios = mockAxios(undefined, undefined, instance);

    await expect(
      // just calls the response interceptor
      axios.get('url')
    ).rejects.toBe(NOT_RESPONSE);
  });

  it('works even when modifying response', async () => {
    const axios = mockAxios();

    const normal = await axios.get('url');
    const transformed = await axios.get('url', {
      transformResponse: (data: unknown) => [data]
    });

    expect(normal.data).toBe(true);
    expect(transformed.data).toStrictEqual([true]);
  });
});
