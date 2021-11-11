import Axios from 'axios';
import { createCache, useCache } from '../../src/cache/create';

describe('tests header interpreter', () => {
  it('tests argument composition', () => {
    const empty = createCache();
    expect(empty).not.toBeUndefined();

    const axios = Axios.create();
    const withAxios = useCache(axios);
    expect(withAxios).not.toBeUndefined();

    const withDefaults = createCache({
      axios: { baseURL: 'base-url' },
      cache: { ttl: 1234 }
    });
    expect(withDefaults).not.toBeUndefined();
    expect(withDefaults.defaults.cache.ttl).toBe(1234);
    expect(withDefaults.defaults.baseURL).toBe('base-url');
  });
});
