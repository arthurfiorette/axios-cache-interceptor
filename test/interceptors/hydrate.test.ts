import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { Header } from '../../src/header/headers.js';
import { mockAxios } from '../mocks/axios.js';
import { mockDateNow } from '../utils.js';

describe('Hydrate handling', () => {
  it('Hydrate is only called when a cache exists', async () => {
    const axios = mockAxios({});

    const m = mock.fn();

    await axios.get('url', {
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);
  });

  it('Only hydrates when cache is stale', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=100, stale-while-revalidate=100' }
    );
    const id = 'some-unique-id';

    const m = mock.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);
    assert.ok(res2.cached);
  });

  it('Hydrates when etag is set', async () => {
    const axios = mockAxios(
      {},
      {
        [Header.ETag]: '42',
        [Header.CacheControl]: 'max-age=0'
      }
    );
    const id = 'some-unique-id';

    const m = mock.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);

    const cache = await axios.storage.get(id);
    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 1);
    assert.ok(res2.cached);
    assert.deepEqual(m.mock.calls[0]?.arguments, [cache]);
  });

  it('Only hydrates when stale while revalidate is set', async () => {
    const axios = mockAxios({}, { [Header.CacheControl]: 'max-age=0, stale-while-revalidate=0' });
    const id = 'some-unique-id';

    const m = mock.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);
    assert.equal(res2.cached, false);
  });

  it('Only hydrates when stale while revalidate is not expired', async () => {
    const axios = mockAxios({}, { [Header.CacheControl]: 'max-age=0, stale-while-revalidate=1' });
    const id = 'some-unique-id';

    const m = mock.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);

    // Sleep entire max age time (using await to function as setImmediate)
    mockDateNow(1000);

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);
    assert.equal(res2.cached, false);
  });

  it('Hydrates when force stale', async () => {
    const axios = mockAxios({}, { [Header.CacheControl]: 'max-age=100' });
    const id = 'some-unique-id';

    const m = mock.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: m }
    });

    assert.equal(m.mock.callCount(), 0);

    const cache = await axios.storage.get(id);
    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: m, override: true }
    });

    assert.equal(m.mock.callCount(), 1);
    assert.deepEqual(m.mock.calls[0]?.arguments, [cache]);
    assert.equal(res2.cached, false);
  });
});
