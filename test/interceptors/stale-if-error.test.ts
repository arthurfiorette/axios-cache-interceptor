import Axios from 'axios';
import { setupCache } from '../../src/cache/create';
import { Header } from '../../src/util/headers';
import { mockAxios } from '../mocks/axios';

describe('Last-Modified handling', () => {
  it('expects that error is thrown', async () => {
    const instance = Axios.create({});
    const axios = setupCache(instance, {});

    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    axios.defaults.cache.staleIfError = 10e5;

    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    axios.defaults.cache.staleIfError = true;

    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    expect.assertions(3);
  });

  it('expects staleIfError does nothing without cache', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => Promise.resolve(true)
    });

    try {
      await axios.get('http://unknown.url.lan:1234');
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    expect.assertions(1);
  });

  it('expects that XAxiosCacheStaleIfError is defined', async () => {
    const axios = mockAxios();

    const { headers } = await axios.get('url', {
      cache: { staleIfError: true }
    });

    expect(headers).toHaveProperty(Header.XAxiosCacheStaleIfError);
  });

  it('expects staleIfError is ignore if config.cache is false', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: false
      });
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    expect.assertions(1);
  });

  it('tests staleIfError', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('http://unknown-url.lan:9090', {
      id,
      cache: { staleIfError: true }
    });

    expect(response).toBeDefined();
    expect(response.id).toBe(id);
    expect(response.data).toBe(cache.data);
    expect(response.status).toBe(cache.status);
    expect(response.statusText).toBe(cache.statusText);
    expect(response.headers).toBe(cache.headers);
    expect(response.cached).toBe(true);
  });

  it('expects that staleIfError needs to be true', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: true
    });

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    const id = 'some-config-id';
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: { staleIfError: false }
      });
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    expect.assertions(1);
  });

  it('tests staleIfError returning false', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => false
    });

    const id = 'some-config-id';
    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id
      });
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    expect.assertions(1);
  });

  it('tests staleIfError as function', async () => {
    const axios = setupCache(Axios.create(), {
      staleIfError: () => {
        return Promise.resolve(false);
      }
    });

    const id = 'some-config-id';

    try {
      await axios.get('http://unknown-url.lan:9090', { id });
      expect(true).toBe(false);
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    try {
      await axios.get('http://unknown-url.lan:9090', {
        id,
        cache: {
          staleIfError: () => 1 // past
        }
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(Axios.isAxiosError(error)).toBe(true);
    }

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('http://unknown-url.lan:9090', {
      id,
      cache: {
        staleIfError: () => 10e5 // nearly infinity :)
      }
    });

    expect(response).toBeDefined();
    expect(response.id).toBe(id);
    expect(response.data).toBe(cache.data);
    expect(response.status).toBe(cache.status);
    expect(response.statusText).toBe(cache.statusText);
    expect(response.headers).toBe(cache.headers);
    expect(response.cached).toBe(true);
  });

  it('tests staleIfError with real 50X status code', async () => {
    const axios = setupCache(Axios.create(), { staleIfError: true });

    const id = 'some-config-id';

    const cache = {
      data: true,
      headers: {},
      status: 200,
      statusText: 'Ok'
    };

    // Fill the cache
    await axios.storage.set(id, {
      state: 'stale',
      createdAt: Date.now(),
      data: cache
    });

    const response = await axios.get('https://httpbin.org/status/503', {
      id
    });

    expect(response).toBeDefined();
    expect(response.id).toBe(id);
    expect(response.data).toBe(cache.data);
    expect(response.status).toBe(cache.status);
    expect(response.statusText).toBe(cache.statusText);
    expect(response.headers).toBe(cache.headers);
    expect(response.cached).toBe(true);

    const newResponse = await axios.get('https://httpbin.org/status/503', {
      id,
      validateStatus: () => true // prevents error
    });

    expect(newResponse).toBeDefined();
    expect(newResponse.id).toBe(id);
    expect(newResponse.data).not.toBe(cache.data);
    expect(newResponse.status).toBe(503);
  });
});
