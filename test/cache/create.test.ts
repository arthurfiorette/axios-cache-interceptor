import Axios from 'axios';
import { createCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const axios = Axios.create();
    const withAxios = createCache(axios);
    expect(withAxios).not.toBeUndefined();

    const withConfig = createCache(axios, { ttl: 1234 });
    expect(withConfig).not.toBeUndefined();
    expect(withConfig.defaults.cache.ttl).toBe(1234);
  });
});
