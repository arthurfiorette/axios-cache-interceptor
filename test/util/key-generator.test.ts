import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { CacheRequestConfig } from '../../src/cache/axios';
import { buildKeyGenerator, defaultKeyGenerator } from '../../src/util/key-generator';
import { mockAxios } from '../mocks/axios';

describe('KeyGeneration', () => {
  it('Generates different key for and id', () => {
    const baseURL = 'http://example.com';
    const url = '/asd/test';
    const method = 'get';
    const params = { a: 1, b: 2 };

    const keyWithoutId = defaultKeyGenerator({
      baseURL,
      url,
      method,
      params
    });

    const keyWithId = defaultKeyGenerator({
      baseURL,
      url,
      method,
      params,
      id: 'random-id'
    });

    assert.notEqual(keyWithoutId, keyWithId);
  });

  it('Merges baseURL with url', () => {
    const method = 'get';
    const params = {};

    const keyWithBoth = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: '/asd/test',
      method,
      params
    });

    const keyWithBaseURL = defaultKeyGenerator({
      baseURL: 'http://example.com/asd/test',
      method,
      params
    });

    const keyWithURL = defaultKeyGenerator({
      url: 'http://example.com/asd/test',
      method,
      params
    });

    assert.equal(keyWithBoth, keyWithBaseURL);
    assert.equal(keyWithBoth, keyWithURL);
  });

  it('Trailing slashes', () => {
    const keysArr = [
      ['http://example.com', 'asd/test'],
      ['http://example.com', 'asd/test/'],
      ['http://example.com', '/asd/test'],
      ['http://example.com', '/asd/test/'],

      ['http://example.com/', 'asd/test'],
      ['http://example.com/', 'asd/test/'],
      ['http://example.com/', '/asd/test'],
      ['http://example.com/', '/asd/test/']
    ];

    const allSame = keysArr
      .map(([baseURL, url]) => ({ baseURL, url }))
      .map((key) => defaultKeyGenerator(key))
      .every((k, _, arr) => k === arr[0]);

    assert.ok(allSame);
  });

  it('Different parameters order', () => {
    const keyABOrder = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: 'asd/test',
      params: { a: 1, b: 2 }
    });
    const keyBAOrder = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: 'asd/test',
      params: { b: 2, a: 1 }
    });

    assert.equal(keyABOrder, keyBAOrder);
  });

  it('Argument replacement', () => {
    const groups = [
      ['http://example.com', '/http://example.com'],
      ['http://example.com', '/http://example.com/'],
      ['http://example.com/', '/http://example.com'],
      ['http://example.com/', '/http://example.com/']
    ];

    for (const [first, second] of groups) {
      assert.equal(defaultKeyGenerator({ url: first }), defaultKeyGenerator({ url: second }));

      assert.equal(
        defaultKeyGenerator({ baseURL: first }),
        defaultKeyGenerator({ baseURL: second })
      );
    }
  });

  it('Unique data and params', () => {
    const def = { baseURL: 'http://example.com', url: '', params: { a: 1, b: 2 } };

    const dataProps = [
      defaultKeyGenerator({ ...def, data: 23 }),
      defaultKeyGenerator({ ...def, data: { c: 3, d: 4 } }),
      defaultKeyGenerator({ ...def, data: -453 }),
      defaultKeyGenerator({ ...def, data: 'string' }),
      defaultKeyGenerator({ ...def, data: new Date() }),
      defaultKeyGenerator({ ...def, data: null }),
      defaultKeyGenerator({ ...def, data: undefined })
    ];

    assert.equal(new Set(dataProps).size, dataProps.length);

    const paramsProps = [
      defaultKeyGenerator({ ...def, params: 23 }),
      defaultKeyGenerator({ ...def, params: { c: 3, d: 4 } }),
      defaultKeyGenerator({ ...def, params: -453 }),
      defaultKeyGenerator({ ...def, params: 'string' }),
      defaultKeyGenerator({ ...def, params: new Date() }),
      defaultKeyGenerator({ ...def, params: Symbol() }),
      defaultKeyGenerator({ ...def, params: null }),
      defaultKeyGenerator({ ...def, params: undefined })
    ];

    assert.equal(new Set(paramsProps).size, paramsProps.length);
  });

  it('BuildKeyGenerator & `hash: false`', async () => {
    const keyGenerator = buildKeyGenerator(({ headers }) =>
      String(headers?.['x-req-header'] || 'not-set')
    );

    const axios = mockAxios({ generateKey: keyGenerator });

    const { id } = await axios.get('random-url', {
      data: Math.random(),
      headers: {
        'x-req-header': 'my-custom-id'
      }
    });

    const { id: id2 } = await axios.get('other-url', {
      data: Math.random() * 2,
      headers: {
        'x-req-header': 'my-custom-id'
      }
    });

    const { id: id3 } = await axios.get('other-url', {
      data: Math.random() * 2
    });

    assert.equal(id, 'my-custom-id');
    assert.equal(id, id2);
    assert.equal(id3, 'not-set');
  });

  it('Response remains unchanged', () => {
    const originalResponse: CacheRequestConfig = {
      baseURL: 'http://example.com/',
      url: '/test/path/',
      method: 'get',
      params: {
        a: 1
      },
      data: {
        object: true
      }
    };

    const response = Object.assign({}, originalResponse);

    const key = defaultKeyGenerator(response);
    assert.ok(key);

    assert.deepEqual(response, originalResponse);

    const key2 = defaultKeyGenerator(response);
    assert.ok(key2);

    assert.equal(key, key2);

    assert.deepEqual(response, originalResponse);
  });

  it('hash() is used in the response', () => {
    const keyGenerator = buildKeyGenerator(({ data }) => data);

    assert.equal(keyGenerator({ data: 'test' }), 'test');
    assert.equal(keyGenerator({ data: 123123 }), '123123');

    let data: unknown = { a: 1 };

    assert.notEqual(keyGenerator({ data }), data);
    assert.equal(typeof keyGenerator({ data }), 'string');

    data = true;

    assert.notEqual(keyGenerator({ data }), data);
    assert.equal(typeof keyGenerator({ data }), 'string');

    data = {
      fn: () => assert.ok(false),
      test: new (class Asd {})()
    };

    assert.notEqual(keyGenerator({ data }), data);
    assert.equal(typeof keyGenerator({ data }), 'string');
  });

  it('KeyGenerator handles recursive objects', () => {
    const recursive: any = {};
    recursive.data = recursive;

    const keyGenerator = buildKeyGenerator(({ data }) => data);

    // We should not throw errors here, as some recursive objects may be handled by axios/other interceptors
    // This way, if any, error happens, it will be thrown by other packages, not this one
    assert.doesNotThrow(() => keyGenerator(recursive));
    assert.doesNotThrow(() => defaultKeyGenerator(recursive));
  });
});
