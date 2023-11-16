import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Axios } from 'axios';
import { buildStorage, canStale, isStorage } from '../../src/storage/build';
import { buildMemoryStorage } from '../../src/storage/memory';
import type { AxiosStorage, StorageValue } from '../../src/storage/types';
import { buildWebStorage } from '../../src/storage/web-api';
import { localStorage } from '../dom';
import { mockAxios } from '../mocks/axios';

describe('General storage functions', () => {
  it('isStorage() function', () => {
    assert.equal(isStorage(void 0), false);
    assert.equal(isStorage(1), false);
    assert.equal(isStorage('a'), false);
    assert.equal(isStorage({}), false);
    assert.equal(isStorage(Axios), false);
    assert.equal(
      isStorage(() => 0),
      false
    );
    assert.equal(isStorage(null), false);
    assert.equal(isStorage(undefined), false);
    assert.equal(isStorage({ a: 1, b: 'a' }), false);

    assert.ok(isStorage(buildMemoryStorage()));
    assert.ok(isStorage(buildWebStorage(localStorage)));
  });

  it('setupCache() without proper storage', () => {
    assert.throws(() => mockAxios({ storage: {} as AxiosStorage }));
  });

  it('Normal request workflow will always have a currentRequest', async () => {
    const memory: Record<string, StorageValue> = {};
    const symbol = 'unique identifier for all requests';

    const storage = buildStorage({
      find(key, cr) {
        //@ts-expect-error ignore
        assert.ok(cr[symbol]);
        return memory[key];
      },
      set(key, value, cr) {
        //@ts-expect-error ignore
        assert.ok(cr[symbol]);
        memory[key] = value;
      },
      remove(key, cr) {
        //@ts-expect-error ignore
        assert.ok(cr[symbol]);
        delete memory[key];
      }
    });

    const axios = mockAxios({ storage });

    // Defines symbol to be used in all requests
    //@ts-expect-error ignore
    axios.defaults[symbol] = true;

    const req1 = axios.get('https://api.example.com/');
    const req2 = axios.get('https://api.example.com/');

    const [res1, res2] = await Promise.all([req1, req2]);

    assert.equal(res1.status, 200);
    assert.equal(res1.cached, false);

    assert.equal(res2.status, 200);
    assert.ok(res2.cached);

    assert.equal(res1.id, res2.id);

    const cache = await axios.storage.get(res1.id, {
      // sample of a request config. Just to the test pass.
      //@ts-expect-error ignore
      [symbol]: true
    });

    assert.equal(cache.state, 'cached');
  });

  it('canStale() function with normal timestamps', () => {
    // ttl + staleTtl + createdAt = future
    assert.ok(
      canStale({
        data: {
          headers: {},
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now(),
        state: 'cached',
        ttl: 1000,
        staleTtl: 1000
      })
    );

    // ttl + staleTtl + createdAt = past
    assert.equal(
      canStale({
        data: {
          headers: {},
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now() - 2001,
        state: 'cached',
        ttl: 1000,
        staleTtl: 1000
      }),
      false
    );

    // createdAt + ttl + (0 staleTtl) = future
    assert.equal(
      canStale({
        data: {
          headers: {},
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now(),
        state: 'cached',
        ttl: 9999999,
        staleTtl: 0
      }),
      false
    );

    // createdAt + ttl = past, + staleTtl = future
    assert.ok(
      canStale({
        data: {
          headers: {},
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now(),
        state: 'cached',
        ttl: 0,
        staleTtl: 1000
      })
    );
  });

  it('canStale() function with MustRevalidate', () => {
    // Normal request, but without must-revalidate
    assert.ok(
      canStale({
        data: {
          headers: {
            'Cache-Control': 'max-age=1'
          },
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now(),
        state: 'cached',
        ttl: 1000,
        staleTtl: 1000
      })
    );

    // Normal request, but with must-revalidate
    assert.equal(
      canStale({
        data: {
          headers: {
            'cache-control': 'must-revalidate, max-age=1'
          },
          data: true,
          status: 200,
          statusText: 'OK'
        },
        createdAt: Date.now(),
        state: 'cached',
        ttl: 1000,
        staleTtl: 1000
      }),
      false
    );
  });
});
