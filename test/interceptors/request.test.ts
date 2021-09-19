import { StatusCodes } from '../../src';
import { axiosMock, mockAxios } from '../mocks/axios';

describe('test request interceptor', () => {
  it('tests against specified methods', async () => {
    const axios = mockAxios({
      // only cache post methods
      methods: ['post']
    });

    const response = await axios.get('');
    const cacheKey = await axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('empty');
  });

  it('tests specified methods', async () => {
    const axios = mockAxios({
      // only cache get methods
      methods: ['get']
    });

    const response = await axios.get('');
    const cacheKey = await axios.generateKey(response.config);
    const cache = await axios.storage.get(cacheKey);

    expect(cache.state).toBe('cached');
  });

  it('tests concurrent requests', async () => {
    const axios = mockAxios();

    const [resp1, resp2] = await Promise.all([axios.get(''), axios.get('')]);

    expect(resp1).toHaveProperty('status', axiosMock.statusCode);
    expect(resp1).toHaveProperty('statusText', axiosMock.statusText);
    expect(resp2).toHaveProperty('status', StatusCodes.CACHED_STATUS_CODE);
    expect(resp2).toHaveProperty('statusText', StatusCodes.CACHED_STATUS_TEXT);
  });
});
