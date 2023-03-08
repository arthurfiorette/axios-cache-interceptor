import { Header } from '../../src';
import { mockAxios } from '../mocks/axios';
import { sleep } from '../utils';

describe('Hydrate works', () => {
  it('expects that hydrate is only called when a cache exists', async () => {
    const axios = mockAxios({});

    const mock = jest.fn();

    await axios.get('url', {
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();
  });

  it('only hydrates when cache is stale', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=100, stale-while-revalidate=100' }
    );
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();
    expect(res2.cached).toBe(true);
  });

  it('hydrates when cache is stale', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=0, stale-while-revalidate=100' }
    );
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    const cache = await axios.storage.get(id);
    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(res2.cached).toBe(false);
    expect(mock).toHaveBeenCalledWith(cache);
  });

  it('hydrates when etag is set', async () => {
    const axios = mockAxios(
      {},
      {
        [Header.ETag]: '42',
        [Header.CacheControl]: 'max-age=0'
      }
    );
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    const cache = await axios.storage.get(id);
    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(res2.cached).toBe(true);
    expect(mock).toHaveBeenCalledWith(cache);
  });

  it('only hydrates when stale while revalidate is set', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=0, stale-while-revalidate=0' }
    );
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();
    expect(res2.cached).toBe(false);
  });

  it('only hydrates when stale while revalidate is not expired', async () => {
    const axios = mockAxios(
      {},
      { [Header.CacheControl]: 'max-age=0, stale-while-revalidate=1' }
    );
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    // Sleep entire max age time.
    await sleep(1000);

    const res2 = await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();
    expect(res2.cached).toBe(false);
  });

  it('hydrates when force stale', async () => {
    const axios = mockAxios({}, { [Header.CacheControl]: `max-age=100` });
    const id = 'some-unique-id';

    const mock = jest.fn();

    await axios.get('url', {
      id,
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();

    const cache = await axios.storage.get(id);
    const res2 = await axios.get('url', {
      id,
      cache: {
        hydrate: mock,
        override: true
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(res2.cached).toBe(false);
    expect(mock).toHaveBeenCalledWith(cache);
  });
});
