import { AxiosStorage } from '../../src/storage/storage';
import { Header } from '../../src/util/headers';

describe('tests abstract storages', () => {
  it('tests storage keep if stale method', () => {
    const etag = AxiosStorage.keepIfStale({
      state: 'cached',
      // Reverse to be ~infinity
      createdAt: 1,
      ttl: Date.now(),
      data: {
        status: 200,
        statusText: '200 OK',
        data: true,
        headers: {
          [Header.ETag]: 'W/"123"'
        }
      }
    });
    expect(etag).toBe(true);

    const modifiedSince = AxiosStorage.keepIfStale({
      state: 'cached',
      // Reverse to be ~infinity
      createdAt: 1,
      ttl: Date.now(),
      data: {
        status: 200,
        statusText: '200 OK',
        data: true,
        headers: {
          [Header.LastModified]: new Date().toUTCString()
        }
      }
    });
    expect(modifiedSince).toBe(true);

    const empty = AxiosStorage.keepIfStale({
      state: 'cached',
      // Reverse to be ~infinity
      createdAt: 1,
      ttl: Date.now(),
      data: {
        status: 200,
        statusText: '200 OK',
        data: true,
        headers: {}
      }
    });
    expect(empty).toBe(false);

    const rest = AxiosStorage.keepIfStale({
      state: 'cached',
      // Reverse to be ~infinity
      createdAt: 1,
      ttl: Date.now(),
      data: {
        status: 200,
        statusText: '200 OK',
        data: true,
        headers: undefined as any
      }
    });
    expect(rest).toBe(false);
  });
});
