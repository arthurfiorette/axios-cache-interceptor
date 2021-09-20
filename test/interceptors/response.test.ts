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
});
