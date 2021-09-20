import { StatusCodes } from '../../src';
import { axiosMock, mockAxios } from '../mocks/axios';

describe('test request interceptor', () => {
  it('tests cache predicate integration', async () => {
    const axios = mockAxios();

    const fetch = () =>
      axios.get('', {
        cache: {
          cachePredicate: {
            responseMatch: () => false
          }
        }
      });

    // Make first request to cache it
    await fetch();
    const result = await fetch();

    expect(result.status).toBe(axiosMock.statusCode);
    expect(result.statusText).toBe(axiosMock.statusText);
  });

  it('tests header interpreter integration', async () => {
    const axiosNoCache = mockAxios({}, { 'cache-control': 'no-cache' });

    // Make first request to cache it
    await axiosNoCache.get('', { cache: { interpretHeader: true } });
    const resultNoCache = await axiosNoCache.get('');

    expect(resultNoCache.status).toBe(axiosMock.statusCode);
    expect(resultNoCache.statusText).toBe(axiosMock.statusText);

    const axiosCache = mockAxios({}, { 'cache-control': `maxAge=${60 * 60 * 24 * 365}` });

    // Make first request to cache it
    await axiosCache.get('', { cache: { interpretHeader: true } });
    const resultCache = await axiosCache.get('');

    expect(resultCache.status).toBe(StatusCodes.CACHED_STATUS_CODE);
    expect(resultCache.statusText).toBe(StatusCodes.CACHED_STATUS_TEXT);
  });

  it('tests update cache integration', async () => {
    const axios = mockAxios();

    const { id } = await axios.get('key01');

    await axios.get('key02', {
      cache: {
        update: {
          [id]: 'delete' as const
        }
      }
    });

    const cache = await axios.storage.get(id);

    expect(cache.state).toBe('empty');
  });
});
