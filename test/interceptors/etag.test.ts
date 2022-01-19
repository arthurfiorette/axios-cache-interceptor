import { Header } from '../../src/header/headers';
import { mockAxios } from '../mocks/axios';
import { sleep } from '../utils';

describe('ETag handling', () => {
  it('tests etag header handling', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'max-age=1' });
    const config = { cache: { interpretHeader: true, etag: true } };

    // initial request
    await axios.get('http://test.com', config);

    const response = await axios.get('http://test.com', config);
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('http://test.com', config);
    // from revalidation
    expect(response2.cached).toBe(true);
    // ensure value from stale cache is kept
    expect(response2.data).toBe(true);
  });

  it('tests etag header handling in global config', async () => {
    const axios = mockAxios(
      { interpretHeader: true, etag: true },
      { etag: 'fakeEtag', 'cache-control': 'max-age=1' }
    );

    // initial request
    await axios.get('http://test.com');

    const response = await axios.get('http://test.com');
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('http://test.com');
    // from revalidation
    expect(response2.cached).toBe(true);
    // ensure value from stale cache is kept
    expect(response2.data).toBe(true);
  });

  it('tests "must revalidate" handling with etag', async () => {
    const axios = mockAxios({}, { etag: 'fakeEtag', 'cache-control': 'must-revalidate' });
    const config = { cache: { interpretHeader: true, etag: true } };

    await axios.get('http://test.com', config);

    // 0ms cache
    await sleep(1);

    const response = await axios.get('http://test.com', config);
    // from etag revalidation
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);
  });

  it('tests custom e-tag', async () => {
    const axios = mockAxios({ ttl: 0 }, { etag: 'fake-etag-2' });
    const config = { cache: { interpretHeader: true, etag: 'fake-etag' } };

    const response = await axios.get('http://test.com', config);
    expect(response.cached).toBe(false);
    expect(response.data).toBe(true);
    expect(response.config.headers?.[Header.IfModifiedSince]).toBeUndefined();
    expect(response.headers?.[Header.LastModified]).toBeUndefined();

    const response2 = await axios.get('http://test.com', config);
    expect(response2.cached).toBe(true);
    expect(response2.data).toBe(true);
    expect(response2.config.headers?.[Header.IfNoneMatch]).toBe('fake-etag');
    expect(response2.headers?.[Header.ETag]).toBe('fake-etag-2');
  });
});
