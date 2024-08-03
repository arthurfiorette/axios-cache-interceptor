import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers.js';
import { mockAxios } from '../mocks/axios.js';
import { mockDateNow } from '../utils.js';

describe('ETag handling', () => {
  it('Etag Header', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'max-age=1' });
    const config = { cache: { interpretHeader: true, etag: true } };

    // initial request
    await axios.get('http://test.com', config);

    const response = await axios.get('http://test.com', config);
    assert.ok(response.cached);
    assert.equal(response.stale, false);
    assert.ok(response.data);

    // Sleep entire max age time.
    await mockDateNow(1000);

    const response2 = await axios.get('http://test.com', config);
    // from revalidation
    assert.ok(response2.cached);
    assert.equal(response.stale, false);
    // ensure value from stale cache is kept
    assert.ok(response2.data);
  });

  it('Etag header handling in global config', async () => {
    const axios = mockAxios(
      { interpretHeader: true, etag: true },
      { etag: 'fakeEtag', 'cache-control': 'max-age=1' }
    );

    // initial request
    await axios.get('http://test.com');

    const response = await axios.get('http://test.com');
    assert.ok(response.cached);
    assert.equal(response.stale, false);
    assert.ok(response.data);

    // Sleep entire max age time.
    mockDateNow(1000);

    const response2 = await axios.get('http://test.com');
    // from revalidation
    assert.ok(response2.cached);
    assert.equal(response.stale, false);
    // ensure value from stale cache is kept
    assert.ok(response2.data);
  });

  it('"must revalidate" handling with Etag', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true, etag: true } };

    await axios.get('http://test.com', config);

    // 1ms cache (using await to function as setImmediate)
    await mockDateNow(1);

    const response = await axios.get('http://test.com', config);
    // from etag revalidation
    assert.ok(response.cached);
    assert.equal(response.stale, false);
    assert.ok(response.data);
  });

  it('Custom Etag', async () => {
    const axios = mockAxios({ ttl: 0 }, { etag: 'fake-etag-2' });
    const config = { cache: { interpretHeader: true, etag: 'fake-etag' } };

    const response = await axios.get('http://test.com', config);
    assert.equal(response.cached, false);
    assert.equal(response.stale, undefined);
    assert.ok(response.data);
    assert.equal(response.config.headers?.[Header.IfModifiedSince], undefined);
    assert.equal(response.headers?.[Header.LastModified], undefined);

    const response2 = await axios.get('http://test.com', config);
    assert.ok(response2.cached);
    assert.equal(!!response.stale, false);
    assert.ok(response2.data);
    assert.equal(response2.config.headers?.[Header.IfNoneMatch], 'fake-etag');
    assert.equal(response2.headers?.[Header.ETag], 'fake-etag-2');
  });
});
