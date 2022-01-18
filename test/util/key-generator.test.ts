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
    const keyGenerator = buildKeyGenerator(false, ({ headers }) =>
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

  it('tests buildKeyGenerator & hash: true', async () => {
    const keyGenerator = buildKeyGenerator(true, ({ headers }) => {
      return headers?.['x-req-header'] || 'not-set';
    });

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

    expect(id).toBe(id2);
    expect(id).not.toBe('my-custom-id'); // hashed value

    expect(id3).not.toBe(id);
    expect(id3).not.toBe(id2);
    expect(id3).not.toBe('not-set');
  });
});
