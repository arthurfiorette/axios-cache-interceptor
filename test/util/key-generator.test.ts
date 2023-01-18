import type { AxiosRequestHeaders } from 'axios';
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
      params,
      headers: {} as AxiosRequestHeaders
    });

    const keyWithId = defaultKeyGenerator({
      baseURL,
      url,
      method,
      params,
      headers: {} as AxiosRequestHeaders,
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
      params,
      headers: {} as AxiosRequestHeaders
    });

    const keyWithBaseURL = defaultKeyGenerator({
      baseURL: 'http://example.com/asd/test',
      method,
      params,
      headers: {} as AxiosRequestHeaders
    });

    const keyWithURL = defaultKeyGenerator({
      url: 'http://example.com/asd/test',
      method,
      params,
      headers: {} as AxiosRequestHeaders
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
      .map(([baseURL, url]) => ({ baseURL, url, headers: {} as AxiosRequestHeaders }))
      .map((key) => defaultKeyGenerator(key))
      .every((k, _, arr) => k === arr[0]);

    expect(allSame).toBeTruthy();
  });

  it('tests against different params order', () => {
    const keyABOrder = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: 'asd/test',
      params: { a: 1, b: 2 },
      headers: {} as AxiosRequestHeaders
    });
    const keyBAOrder = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: 'asd/test',
      params: { b: 2, a: 1 },
      headers: {} as AxiosRequestHeaders
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
      expect(
        defaultKeyGenerator({ url: first, headers: {} as AxiosRequestHeaders })
      ).toBe(defaultKeyGenerator({ url: second, headers: {} as AxiosRequestHeaders }));
      expect(
        defaultKeyGenerator({ baseURL: first, headers: {} as AxiosRequestHeaders })
      ).toBe(
        defaultKeyGenerator({ baseURL: second, headers: {} as AxiosRequestHeaders })
      );
    }
  });

  it('tests unique data and params', () => {
    const def = {
      baseURL: 'http://example.com',
      headers: {} as AxiosRequestHeaders,
      url: '',
      params: { a: 1, b: 2 }
    };

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
    const originalReq = {
      baseURL: 'http://example.com/',
      url: '/test/path/',
      method: 'get',
      params: {
        a: 1
      },
      data: {
        object: true
      },
      headers: {} as AxiosRequestHeaders
    };

    const request = Object.assign({}, originalReq);

    const key = defaultKeyGenerator(request);
    expect(key).toBeDefined();

    expect(request).toEqual(originalReq);

    const key2 = defaultKeyGenerator(request);
    expect(key2).toBeDefined();

    expect(key).toBe(key2);

    expect(request).toEqual(originalReq);
  });

  it('tests when hash() is used in the response', () => {
    const keyGenerator = buildKeyGenerator(({ data }) => data);

    expect(keyGenerator({ data: 'test', headers: {} as AxiosRequestHeaders })).toBe(
      'test'
    );
    expect(keyGenerator({ data: 123123, headers: {} as AxiosRequestHeaders })).toBe(
      '123123'
    );

    let data: unknown = { a: 1 };

    expect(keyGenerator({ data, headers: {} as AxiosRequestHeaders })).not.toBe(data);
    expect(typeof keyGenerator({ data, headers: {} as AxiosRequestHeaders })).toBe(
      'string'
    );

    data = true;

    expect(keyGenerator({ data, headers: {} as AxiosRequestHeaders })).not.toBe(data);
    expect(typeof keyGenerator({ data, headers: {} as AxiosRequestHeaders })).toBe(
      'string'
    );

    data = {
      fn: () => expect(false).toBeTruthy(),
      test: new (class Asd {})()
    };

    expect(keyGenerator({ data, headers: {} as AxiosRequestHeaders })).not.toBe(data);
    expect(typeof keyGenerator({ data, headers: {} as AxiosRequestHeaders })).toBe(
      'string'
    );
  });
});
