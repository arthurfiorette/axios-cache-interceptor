import { createValidateStatus, isMethodIn } from '../../src/interceptors/util';
import { mockAxios } from '../mocks/axios';

import Axios from 'axios';

describe('test util functions', () => {
  it('tests validate-status function', () => {
    const def = createValidateStatus();
    expect(def(200)).toBe(true);
    expect(def(345)).toBe(false);
    expect(def(304)).toBe(true);

    const only200 = createValidateStatus((s) => s >= 200 && s < 300);
    expect(only200(200)).toBe(true);
    expect(only200(299)).toBe(true);
    expect(only200(304)).toBe(true);
    expect(only200(345)).toBe(false);

    const randomValue = createValidateStatus((s) => s >= 405 && s <= 410);
    expect(randomValue(200)).toBe(false);
    expect(randomValue(404)).toBe(false);
    expect(randomValue(405)).toBe(true);
    expect(randomValue(304)).toBe(true);
  });

  it('tests isMethodIn function', () => {
    expect(isMethodIn('get', ['get', 'post'])).toBe(true);
    expect(isMethodIn('get', ['get', 'post', 'put'])).toBe(true);
    expect(isMethodIn('post', ['get', 'post', 'put'])).toBe(true);

    expect(isMethodIn()).toBe(false);
    expect(isMethodIn('get', [])).toBe(false);
    expect(isMethodIn('post', ['get', 'put', 'delete'])).toBe(false);
    expect(isMethodIn('get', ['post', 'put', 'delete'])).toBe(false);
  });

  it('the correct order of axios interceptors', async () => {
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

    expect(order).toEqual([3, 1, 2, 4]);
  });
});
