import type { CacheRequestConfig } from '../../src';
import { Header } from '../../src/header/headers';
import { mockAxios, XMockRandom } from '../mocks/axios';
import { sleep } from '../utils';

describe('Last-Modified handling', () => {
  it('tests last modified header handling', async () => {
    const axios = mockAxios(
      {},
      {
        'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
        'cache-control': 'max-age=1'
      }
    );

    const config: CacheRequestConfig = {
      id: 'same request',
      cache: { interpretHeader: true, modifiedSince: true }
    };

    await axios.get('url', config);

    const response = await axios.get('url', config);
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('url', config);
    // from revalidation
    expect(response2.cached).toBe(true);
    expect(response2.status).toBe(200);
  });

  it('tests last modified header handling in global config', async () => {
    const axios = mockAxios(
      { interpretHeader: true, modifiedSince: true },
      {
        'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
        'cache-control': 'max-age=1'
      }
    );

    await axios.get('url');

    const response = await axios.get('url');
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('url');
    // from revalidation
    expect(response2.cached).toBe(true);
    expect(response2.status).toBe(200);
  });

  it('tests modifiedSince as date', async () => {
    const axios = mockAxios({ ttl: 0 });

    const config: CacheRequestConfig = {
      id: 'same request',
      cache: { modifiedSince: new Date(2014, 1, 1) }
    };

    const response = await axios.get('url', config);
    expect(response.cached).toBe(false);
    expect(response.data).toBe(true);
    expect(response.config.headers?.[Header.IfModifiedSince]).toBeUndefined();
    expect(response.headers?.[Header.XAxiosCacheLastModified]).toBeDefined();

    const response2 = await axios.get('url', config);
    expect(response2.cached).toBe(true);
    expect(response2.data).toBe(true);
    expect(response2.config.headers?.[Header.IfModifiedSince]).toBeDefined();
    expect(response2.headers?.[Header.XAxiosCacheLastModified]).toBeDefined();
  });

  it('tests modifiedSince using cache timestamp', async () => {
    const axios = mockAxios(
      {},
      {
        [Header.CacheControl]: 'max-age=0',
        // etag is a header to makes a response able to stale
        [Header.ETag]: 'W/123'
      }
    );

    const config: CacheRequestConfig = {
      id: 'same request',
      cache: { interpretHeader: true, modifiedSince: true }
    };

    // pre caches
    await axios.get('url', config);

    const response = await axios.get('url', config);
    const modifiedSince = response.config.headers?.[Header.IfModifiedSince] as string;

    expect(modifiedSince).toBeDefined();

    const milliseconds = Date.parse(modifiedSince);

    expect(typeof milliseconds).toBe('number');
    expect(milliseconds).toBeLessThan(Date.now());
  });

  it('tests header overriding with 304', async () => {
    const axios = mockAxios();

    // First request, return x-my-header. Ttl 1 to make the cache stale
    const firstResponse = await axios.get('url', { cache: { ttl: -1 } });
    const firstMyHeader: unknown = firstResponse.headers?.[XMockRandom];

    expect(firstMyHeader).toBeDefined();
    expect(Number(firstMyHeader)).not.toBeNaN();

    // Second request with 304 Not Modified
    const secondResponse = await axios.get('url', {
      cache: { modifiedSince: true }
    });
    const secondMyHeader: unknown = secondResponse.headers?.[XMockRandom];

    expect(secondMyHeader).toBeDefined();
    expect(Number(secondMyHeader)).not.toBeNaN();
    expect(secondMyHeader).not.toBe(firstMyHeader);
  });
});
