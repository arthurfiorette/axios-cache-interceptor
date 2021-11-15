import { Header } from '../../src/util/headers';
import { mockAxios } from '../mocks/axios';
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
  });

  it('tests last modified header handling in global config', async () => {
    const axios = mockAxios(
      { interpretHeader: true, modifiedSince: true },
      {
        'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
        'cache-control': 'max-age=1'
      }
    );

    await axios.get('');

    const response = await axios.get('');
    expect(response.cached).toBe(true);
    expect(response.data).toBe(true);

    // Sleep entire max age time.
    await sleep(1000);

    const response2 = await axios.get('');
    // from revalidation
    expect(response2.cached).toBe(true);
    expect(response2.status).toBe(200);
  });

  it('tests modifiedSince as date', async () => {
    const axios = mockAxios({ ttl: 0 });

    const config = {
      cache: { modifiedSince: new Date(2014, 1, 1) }
    };

    const response = await axios.get('', config);
    expect(response.cached).toBe(false);
    expect(response.data).toBe(true);
    expect(response.config.headers?.[Header.IfModifiedSince]).toBeUndefined();
    expect(response.headers?.[Header.XAxiosCacheLastModified]).toBeDefined();

    const response2 = await axios.get('', config);
    expect(response2.cached).toBe(true);
    expect(response2.data).toBe(true);
    expect(response2.config.headers?.[Header.IfModifiedSince]).toBeDefined();
    expect(response2.headers?.[Header.XAxiosCacheLastModified]).toBeDefined();
  });

  it('tests modifiedSince using cache timestamp', async () => {
    const axios = mockAxios(
      {},
      {
        'cache-control': 'must-revalidate'
      }
    );

    const config = {
      cache: { interpretHeader: true, modifiedSince: true }
    };

    await axios.get('', config);
    const response = await axios.get('', config);

    const modifiedSince = response.config.headers?.[Header.IfModifiedSince];

    if (!modifiedSince) {
      throw new Error('modifiedSince is not defined');
    }
    const milliseconds = Date.parse(modifiedSince);

    expect(typeof milliseconds).toBe('number');
    expect(milliseconds).toBeLessThan(Date.now());
  });
});
