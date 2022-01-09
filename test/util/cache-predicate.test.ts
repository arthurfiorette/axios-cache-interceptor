import { testCachePredicate } from '../../src';
import type { CachedStorageValue } from '../../src/storage/types';
import { mockAxios } from '../mocks/axios';
import { createResponse } from '../utils';

describe('tests cache predicate object', () => {
  it('tests some empty usage', () => {
    const response = createResponse({ status: 200 });

    expect(testCachePredicate(response, {})).toBeTruthy();
  });

  it('tests custom cased headers', () => {
    const response = createResponse({ headers: { 'Content-Type': 'application/json' } });

    expect(
      testCachePredicate(response, {
        containsHeaders: {
          'Content-Type': (h) => h === 'application/json'
        }
      })
    ).toBeTruthy();
  });

  it('tests statusCheck with a predicate', () => {
    const response = createResponse({ status: 764 });

    expect(
      testCachePredicate(response, {
        statusCheck: (status) => status >= 200 && status <= 299
      })
    ).toBeFalsy();

    expect(
      testCachePredicate(response, {
        statusCheck: (status) => status >= 760 && status <= 769
      })
    ).toBeTruthy();
  });

  it('tests containsHeader header casing', () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    expect(
      testCachePredicate(response, {
        containsHeaders: { 'content-type': () => true }
      })
    ).toBeTruthy();

    expect(
      testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => true }
      })
    ).toBeTruthy();

    expect(
      testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => true }
      })
    ).toBeTruthy();
  });

  it('tests containsHeader', () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    const isJsonLowercase = testCachePredicate(response, {
      containsHeaders: { 'content-type': (h) => h === 'application/json' }
    });

    const isJsonContent = testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (h) => h === 'application/json' }
    });

    const isXmlContent = testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (h) => h === 'application/xml' }
    });

    expect(isXmlContent).toBeFalsy();
    expect(isJsonLowercase).toBeTruthy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests containsHeader with string predicate', () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    const headerExists = testCachePredicate(response, {
      containsHeaders: { 'content-type': (header) => header === 'application/json' }
    });

    const isXmlContent = testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (header) => header === 'application/xml' }
    });

    const isJsonContent = testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (header) => header === 'application/json' }
    });

    expect(headerExists).toBeTruthy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests responseMatch', () => {
    const response = createResponse({
      data: { a: true, b: 1 }
    });

    expect(
      testCachePredicate(response, {
        responseMatch: ({ data }) => data && data.a === true && data.b === 1
      })
    ).toBeTruthy();

    expect(
      testCachePredicate(response, ({ data }) => data && data.a === true && data.b === 1)
    ).toBeTruthy();

    expect(
      testCachePredicate(response, {
        responseMatch: ({ data }) => data && (data.a !== true || data.b !== 1)
      })
    ).toBeFalsy();
  });

  it('tests generics and typescript types', async () => {
    const axios = mockAxios();

    const result = await axios.get<{ a: boolean; b: number }>('url', {
      cache: {
        ttl: ({ data }) => {
          return data.b;
        },
        cachePredicate: {
          responseMatch: ({ data }) => {
            return data.a;
          }
        },
        update: {
          id: (
            _,
            { data: { a, b }, headers, status, statusText }
          ): CachedStorageValue => {
            return {
              state: 'cached',
              ttl: Infinity,
              createdAt: Date.now(),
              data: {
                headers,
                status,
                statusText,
                data: { a, b }
              }
            };
          }
        }
      }
    });

    expect(result).toBeDefined();
  });
});
