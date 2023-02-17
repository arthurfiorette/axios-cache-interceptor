import { mockAxios } from '../mocks/axios';

describe('Hydrate works', () => {
  it('expects that hydrate is only called when a cache exists', async () => {
    const axios = mockAxios({});

    const mock = jest.fn();

    await axios.get('url', {
      cache: { hydrate: mock }
    });

    expect(mock).not.toHaveBeenCalled();
  });

  it('only hydrates when cache is returned', async () => {
    const axios = mockAxios({});
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

  it('hydrates when a new request is needed', async () => {
    const axios = mockAxios({});
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

    const cache = await axios.storage.get(id);
    const res3 = await axios.get('url', {
      id,
      cache: {
        hydrate: mock,
        override: true
      }
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(res3.cached).toBe(false);
    expect(mock).toHaveBeenCalledWith(cache);
  });
});
