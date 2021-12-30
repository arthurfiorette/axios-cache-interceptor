import Axios from 'axios';
import { setupCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const axios = Axios.create();
    const withAxios = setupCache(axios);
    expect(withAxios).not.toBeUndefined();

    const withConfig = setupCache(axios, { ttl: 1234 });
    expect(withConfig).not.toBeUndefined();
    expect(withConfig.defaults.cache.ttl).toBe(1234);
  });
});
