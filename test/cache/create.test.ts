import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import Axios from 'axios';
import { setupCache } from '../../src/cache/create.ts';

describe('Axios Cache Interceptor instances', () => {
  it('Argument composition', () => {
    const withAxios = setupCache(Axios.create());
    assert.notEqual(withAxios, undefined);
    assert.notEqual(withAxios.defaults.cache.ttl, 1234);

    const withConfig = setupCache(Axios.create(), { ttl: 1234 });
    assert.notEqual(withConfig, undefined);
    assert.equal(withConfig.defaults.cache.ttl, 1234);
  });

  it('Double registration gets rejected', () => {
    const axios = Axios.create();
    const withAxios = setupCache(axios);
    assert.notEqual(withAxios, undefined);
    assert.throws(() => setupCache(axios));
  });

  it('Importing with __ACI_DEV__ true prints console warning', async () => {
    assert.ok(__ACI_DEV__);

    const oldLog = console.error;

    const consoleMock = mock.fn();
    console.error = consoleMock;

    await import('../../src/index.ts');

    assert.equal(consoleMock.mock.callCount(), 1);

    console.error = oldLog;
  });

  it('allows disabling automatic registration', async () => {
    const instance = Axios.create();
    let requestCalls = 0;
    let responseCalls = 0;

    const axios = setupCache(instance, {
      register: false,
      requestInterceptor: {
        onFulfilled(config) {
          requestCalls++;
          return config;
        }
      },
      responseInterceptor: {
        onFulfilled(response) {
          responseCalls++;
          return response;
        }
      }
    });

    axios.defaults.adapter = async (config) => ({
      data: true,
      status: 200,
      statusText: '200 OK',
      headers: {},
      config,
      request: { config }
    });

    await axios.get('url');

    assert.equal(requestCalls, 0);
    assert.equal(responseCalls, 0);

    assert.notEqual(axios, undefined);
  });
});
