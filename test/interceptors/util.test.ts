import assert from 'node:assert';
import { describe, it } from 'node:test';
import Axios from 'axios';
import { createValidateStatus, isMethodIn } from '../../src/interceptors/util.js';
import { mockAxios } from '../mocks/axios.js';

describe('Util Functions', () => {
  it('validateStatus function', () => {
    const def = createValidateStatus();
    assert.ok(def(200));
    assert.equal(def(345), false);
    assert.ok(def(304));

    const only200 = createValidateStatus((s) => s >= 200 && s < 300);
    assert.ok(only200(200));
    assert.ok(only200(299));
    assert.ok(only200(304));
    assert.equal(only200(345), false);

    const randomValue = createValidateStatus((s) => s >= 405 && s <= 410);
    assert.equal(randomValue(200), false);
    assert.equal(randomValue(404), false);
    assert.ok(randomValue(405));
    assert.ok(randomValue(304));
  });

  it('isMethodIn function', () => {
    assert.ok(isMethodIn('get', ['get', 'post']));
    assert.ok(isMethodIn('get', ['get', 'post', 'put']));
    assert.ok(isMethodIn('post', ['get', 'post', 'put']));

    assert.equal(isMethodIn(), false);
    assert.equal(isMethodIn('get', []), false);
    assert.equal(isMethodIn('post', ['get', 'put', 'delete']), false);
    assert.equal(isMethodIn('get', ['post', 'put', 'delete']), false);
  });

  it('Correct order of axios interceptors', async () => {
    const axios = Axios.create();

    const order = [] as number[];

    axios.interceptors.request.use((cfg) => {
      order.push(1);
      return cfg;
    });

    axios.interceptors.response.use((res) => {
      order.push(2);
      return res;
    });

    // setupCache registers internal interceptors
    mockAxios(undefined, undefined, axios);

    axios.interceptors.request.use((cfg) => {
      order.push(3);
      return cfg;
    });

    axios.interceptors.response.use((res) => {
      order.push(4);
      return res;
    });

    await axios.get('url');

    assert.deepEqual(order, [3, 1, 2, 4]);
  });
});
