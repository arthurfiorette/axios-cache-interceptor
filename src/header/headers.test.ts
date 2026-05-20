import { Header } from './headers';

describe('Header Constants', () => {
  test('should define IfModifiedSince header', () => {
    expect(Header.IfModifiedSince).toBe('if-modified-since');
  });

  test('should define LastModified header', () => {
    expect(Header.LastModified).toBe('last-modified');
  });

  test('should define IfNoneMatch header', () => {
    expect(Header.IfNoneMatch).toBe('if-none-match');
  });

  test('should define CacheControl header', () => {
    expect(Header.CacheControl).toBe('cache-control');
  });

  test('should define Pragma header', () => {
    expect(Header.Pragma).toBe('pragma');
  });

  test('should define ETag header', () => {
    expect(Header.ETag).toBe('etag');
  });

  test('should define Expires header', () => {
    expect(Header.Expires).toBe('expires');
  });

  test('should define Age header', () => {
    expect(Header.Age).toBe('age');
  });

  test('should define XAxiosCacheEtag header', () => {
    expect(Header.XAxiosCacheEtag).toBe('x-axios-cache-etag');
  });

  test('should define XAxiosCacheLastModified header', () => {
    expect(Header.XAxiosCacheLastModified).toBe('x-axios-cache-last-modified');
  });

  test('should define XAxiosCacheStaleIfError header', () => {
    expect(Header.XAxiosCacheStaleIfError).toBe('x-axios-cache-stale-if-error');
  });

  test('should have all expected header keys', () => {
    const expectedKeys = [
      'IfModifiedSince',
      'LastModified',
      'IfNoneMatch',
      'CacheControl',
      'Pragma',
      'ETag',
      'Expires',
      'Age',
      'XAxiosCacheEtag',
      'XAxiosCacheLastModified',
      'XAxiosCacheStaleIfError'
    ];
    
    const actualKeys = Object.keys(Header);
    expect(actualKeys.sort()).toEqual(expectedKeys.sort());
  });

  test('should be defined as a constant object', () => {
    // Check that Header object exists and is properly defined
    expect(Header).toBeDefined();
    expect(typeof Header).toBe('object');
  });

  test('should have lowercase string values for HTTP compliance', () => {
    const headerValues = Object.values(Header);
    headerValues.forEach(value => {
      expect(typeof value).toBe('string');
      expect(value).toBe(value.toLowerCase()); // HTTP headers should be treated as case-insensitive
    });
  });
});