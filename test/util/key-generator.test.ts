import { defaultKeyGenerator } from '../../src/util/key-generator';

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
    const key = defaultKeyGenerator({
      baseURL: 'http://example.com',
      url: '',
      params: { a: 1, b: 2 }
    });

    expect(key).toBe('get::http://example.com::{"a":1,"b":2}');

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
});
