import Axios from 'axios';
import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { setupCache } from '../../src/cache/create';

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

    await import('../../src/index');

    assert.equal(consoleMock.mock.callCount(), 1);

    console.error = oldLog;
  });
});
