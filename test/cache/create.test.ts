import Axios from 'axios';
import { isAxiosCacheInterceptor, setupCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const axios = Axios.create();
    const withAxios = setupCache(axios);
    expect(withAxios).not.toBeUndefined();

    const withConfig = setupCache(axios, { ttl: 1234 });
    expect(withConfig).not.toBeUndefined();
    expect(withConfig.defaults.cache.ttl).toBe(1234);
  });

  it('tests isAxiosCacheInterceptor', () => {
    expect(isAxiosCacheInterceptor(void 0)).toBe(false);
    expect(isAxiosCacheInterceptor(1)).toBe(false);
    expect(isAxiosCacheInterceptor('a')).toBe(false);
    expect(isAxiosCacheInterceptor({})).toBe(false);
    expect(isAxiosCacheInterceptor(Axios)).toBe(false);
    expect(isAxiosCacheInterceptor(() => 0)).toBe(false);
    expect(isAxiosCacheInterceptor(null)).toBe(false);
    expect(isAxiosCacheInterceptor(undefined)).toBe(false);
    expect(isAxiosCacheInterceptor({ a: 1, b: 'a' })).toBe(false);

    expect(isAxiosCacheInterceptor(setupCache(Axios.create()))).toBe(true);
  });
});
