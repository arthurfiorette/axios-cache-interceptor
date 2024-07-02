import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { CacheRequestConfig } from '../../src/cache/axios.js';
import { Header } from '../../src/header/headers.js';
import { XMockRandom, mockAxios } from '../mocks/axios.js';
import { mockDateNow } from '../utils.js';

describe('LastModified handling', () => {
  it('Last modified header handling', async () => {
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
    assert.ok(response.cached);
    assert.equal(response.stale, false);
    assert.ok(response.data);

    // Sleep entire max age time (using await to function as setImmediate)
    await mockDateNow(1);

    const response2 = await axios.get('url', config);
    // from revalidation
    assert.ok(response2.cached);
    assert.equal(response.stale, false);
    assert.equal(response2.status, 200);
  });

  it('Last modified header handling in global config', async () => {
    const axios = mockAxios(
      { interpretHeader: true, modifiedSince: true },
      {
        'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
        'cache-control': 'max-age=1'
      }
    );

    await axios.get('url');

    const response = await axios.get('url');
    assert.ok(response.cached);
    assert.equal(response.stale, false);
    assert.ok(response.data);

    // Sleep entire max age time (using await to function as setImmediate)
    await mockDateNow(1);

    const response2 = await axios.get('url');
    // from revalidation
    assert.ok(response2.cached);
    assert.equal(response.stale, false);
    assert.equal(response2.status, 200);
  });

  it('ModifiedSince as Date', async () => {
    const axios = mockAxios({ ttl: 0 });

    const config: CacheRequestConfig = {
      id: 'same request',
      cache: { modifiedSince: new Date(2014, 1, 1) }
    };

    const response = await axios.get('url', config);
    assert.equal(response.cached, false);
    assert.equal(response.stale, undefined);
    assert.ok(response.data);
    assert.equal(response.config.headers?.[Header.IfModifiedSince], undefined);
    assert.ok(response.headers?.[Header.XAxiosCacheLastModified]);

    const response2 = await axios.get('url', config);
    assert.ok(response2.cached);
    assert.equal(!!response.stale, false);
    assert.ok(response2.data);
    assert.ok(response2.config.headers?.[Header.IfModifiedSince]);
    assert.ok(response2.headers?.[Header.XAxiosCacheLastModified]);
  });

  it('ModifiedSince using cache timestamp', async () => {
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

    assert.ok(modifiedSince);

    const milliseconds = Date.parse(modifiedSince);

    assert.equal(typeof milliseconds, 'number');
    assert.ok(milliseconds < Date.now());
  });

  it('Header overriding with 304', async () => {
    const axios = mockAxios();

    // First request, return x-my-header. Ttl 1 to make the cache stale
    const firstResponse = await axios.get('url', { cache: { ttl: -1 } });
    const firstMyHeader: unknown = firstResponse.headers?.[XMockRandom];

    assert.ok(firstMyHeader);
    assert.notEqual(Number(firstMyHeader), NaN);

    // Second request with 304 Not Modified
    const secondResponse = await axios.get('url', {
      cache: { modifiedSince: true }
    });
    const secondMyHeader: unknown = secondResponse.headers?.[XMockRandom];

    assert.ok(secondMyHeader);
    assert.notEqual(Number(secondMyHeader), NaN);
    assert.notEqual(secondMyHeader, firstMyHeader);
  });
});
