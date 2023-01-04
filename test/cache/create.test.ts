import Axios from 'axios';
import { setupCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const withAxios = setupCache(Axios.create());
    expect(withAxios).not.toBeUndefined();
    expect(withAxios.defaults.cache.ttl).not.toBe(1234);

    const withConfig = setupCache(Axios.create(), { ttl: 1234 });
    expect(withConfig).not.toBeUndefined();
    expect(withConfig.defaults.cache.ttl).toBe(1234);
  });

  it('expects double registration is rejected', () => {
    const axios = Axios.create();
    const withAxios = setupCache(axios);
    expect(withAxios).not.toBeUndefined();

    expect(() => setupCache(axios)).toThrowError();
  });
});
