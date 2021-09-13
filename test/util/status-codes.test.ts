import { StatusCodes } from '../../src/';
import { axiosMock, mockAxios } from '../mocks/axios';

const KEY = 'cacheKey';

describe('Tests cached status code', () => {
  it('test response status code', async () => {
    const axios = mockAxios({
      // Accept all status codes
      cachePredicate: () => true
    });

    axios.storage.set(KEY, {
      data: { body: true },
      ttl: Infinity,
      createdAt: Date.now(),
      state: 'cached'
    });

    const firstResponse = await axios.get(axiosMock.url);
    expect(firstResponse.status).toBe(axiosMock.statusCode);
    expect(firstResponse.statusText).toBe(axiosMock.statusText);

    const secondResponse = await axios.get(axiosMock.url);
    expect(secondResponse.status).not.toBe(axiosMock.statusCode);
    expect(secondResponse.statusText).not.toBe(axiosMock.statusText);

    expect(secondResponse.status).toBe(StatusCodes.CACHED_RESPONSE_STATUS);
    expect(secondResponse.statusText).toBe(StatusCodes.CACHED_RESPONSE_STATUS_TEXT);
  });
});
