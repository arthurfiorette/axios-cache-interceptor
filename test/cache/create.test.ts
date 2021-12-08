import Axios from 'axios';
import { useCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const axios = Axios.create();
    const withAxios = useCache(axios);
    expect(withAxios).not.toBeUndefined();

    const withConfig = useCache(axios, { ttl: 1234 });
    expect(withConfig).not.toBeUndefined();
    expect(withConfig.defaults.cache.ttl).toBe(1234);
  });
});
