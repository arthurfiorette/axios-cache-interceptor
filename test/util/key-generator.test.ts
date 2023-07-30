import type { CacheRequestConfig } from '../../src/cache/axios';
import { buildKeyGenerator, defaultKeyGenerator } from '../../src/util/key-generator';
import { mockAxios } from '../mocks/axios';

describe('tests key generation', () => {
  it('should generate different key for and id', () => {
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

    expect(keyWithoutId).not.toEqual(keyWithId);
  });

  it('should merge baseURL with url', () => {
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

    expect(keyWithBoth).toEqual(keyWithBaseURL);
    expect(keyWithBoth).toEqual(keyWithURL);
  });

  it('tests against trailing slashes', () => {
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

    expect(allSame).toBeTruthy();
  });

  it('tests against different params order', () => {
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

    expect(keyABOrder).toBe(keyBAOrder);
  });

  it('tests argument replacement', () => {
    const groups = [
      ['http://example.com', '/http://example.com'],
      ['http://example.com', '/http://example.com/'],
      ['http://example.com/', '/http://example.com'],
      ['http://example.com/', '/http://example.com/']
    ];

    for (const [first, second] of groups) {
      expect(defaultKeyGenerator({ url: first })).toBe(
        defaultKeyGenerator({ url: second })
      );
      expect(defaultKeyGenerator({ baseURL: first })).toBe(
        defaultKeyGenerator({ baseURL: second })
      );
    }
  });

  it('tests unique data and params', () => {
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

    expect(new Set(dataProps).size).toBe(dataProps.length);

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

    expect(new Set(paramsProps).size).toBe(paramsProps.length);
  });

  it('tests buildKeyGenerator & hash: false', async () => {
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

    expect(id).toBe('my-custom-id');
    expect(id).toBe(id2);
    expect(id3).toBe('not-set');
  });

  it('expects that the response remains unchanged', () => {
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
    expect(key).toBeDefined();

    expect(response).toEqual(originalResponse);

    const key2 = defaultKeyGenerator(response);
    expect(key2).toBeDefined();

    expect(key).toBe(key2);

    expect(response).toEqual(originalResponse);
  });

  it('tests when hash() is used in the response', () => {
    const keyGenerator = buildKeyGenerator(({ data }) => data);

    expect(keyGenerator({ data: 'test' })).toBe('test');
    expect(keyGenerator({ data: 123123 })).toBe('123123');

    let data: unknown = { a: 1 };

    expect(keyGenerator({ data })).not.toBe(data);
    expect(typeof keyGenerator({ data })).toBe('string');

    data = true;

    expect(keyGenerator({ data })).not.toBe(data);
    expect(typeof keyGenerator({ data })).toBe('string');

    data = {
      fn: () => expect(false).toBeTruthy(),
      test: new (class Asd {})()
    };

    expect(keyGenerator({ data })).not.toBe(data);
    expect(typeof keyGenerator({ data })).toBe('string');
  });

  it('expects key generator handles recursive objects', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recursive: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    recursive.data = recursive;

    const keyGenerator = buildKeyGenerator(({ data }) => data);

    // We should not throw errors here, as some recursive objects may be handled by axios/other interceptors
    // This way, if any, error happens, it will be thrown by other packages, not this one
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(() => keyGenerator(recursive)).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(() => defaultKeyGenerator(recursive)).not.toThrow();
  });
});
