import { testCachePredicate } from '../../src';
import type { CachedStorageValue } from '../../src/storage/types';
import { mockAxios } from '../mocks/axios';
import { createResponse } from '../utils';

describe('tests cache predicate object', () => {
  it('tests some empty usage', () => {
    const response = createResponse({ status: 200 });

    expect(testCachePredicate(response, {})).toBeTruthy();
  });

  it('tests custom cased headers', async () => {
    const response = createResponse({ headers: { 'Content-Type': 'application/json' } });

    expect(
      await testCachePredicate(response, {
        containsHeaders: {
          'Content-Type': (h) => h === 'application/json'
        }
      })
    ).toBeTruthy();
  });

  it('tests statusCheck with a predicate', async () => {
    const response = createResponse({ status: 764 });

    expect(
      await testCachePredicate(response, {
        statusCheck: (status) => status >= 200 && status <= 299
      })
    ).toBeFalsy();

    expect(
      await testCachePredicate(response, {
        statusCheck: (status) => status >= 760 && status <= 769
      })
    ).toBeTruthy();
  });

  it('tests containsHeader header casing', async () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    expect(
      await testCachePredicate(response, {
        containsHeaders: { 'content-type': () => true }
      })
    ).toBeTruthy();

    expect(
      await testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => true }
      })
    ).toBeTruthy();

    expect(
      await testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => true }
      })
    ).toBeTruthy();
  });

  it('tests containsHeader', async () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    const isJsonLowercase = await testCachePredicate(response, {
      containsHeaders: { 'content-type': (h) => h === 'application/json' }
    });

    const isJsonContent = await testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (h) => h === 'application/json' }
    });

    const isXmlContent = await testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (h) => h === 'application/xml' }
    });

    expect(isXmlContent).toBeFalsy();
    expect(isJsonLowercase).toBeTruthy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests containsHeader with string predicate', async () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    const headerExists = await testCachePredicate(response, {
      containsHeaders: { 'content-type': (header) => header === 'application/json' }
    });

    const isXmlContent = await testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (header) => header === 'application/xml' }
    });

    const isJsonContent = await testCachePredicate(response, {
      containsHeaders: { 'Content-Type': (header) => header === 'application/json' }
    });

    expect(headerExists).toBeTruthy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests responseMatch', async () => {
    const response = createResponse({
      data: { a: true, b: 1 }
    });

    expect(
      await testCachePredicate(response, {
        responseMatch: ({ data }) => data && data.a === true && data.b === 1
      })
    ).toBeTruthy();

    expect(
      await testCachePredicate(
        response,
        ({ data }) => data && data.a === true && data.b === 1
      )
    ).toBeTruthy();

    expect(
      await testCachePredicate(response, {
        responseMatch: ({ data }) => data && (data.a !== true || data.b !== 1)
      })
    ).toBeFalsy();
  });

  it('tests responseMath, containsHeaders with async functions', async () => {
    const response = createResponse({
      data: { a: true, b: 1 },
      status: 399,
      headers: { 'cache-control': 'no-cache' }
    });

    expect(
      await testCachePredicate(response, {
        containsHeaders: {
          'cache-control': async (h) => {
            await 0; // jumps to next nodejs event loop tick

            return h !== 'no-cache';
          }
        }
      })
    ).toBeFalsy();

    expect(
      await testCachePredicate(response, {
        containsHeaders: {
          'cache-control': async (header) => {
            await 0; // jumps to next nodejs event loop tick
            return header === 'no-cache';
          }
        }
      })
    ).toBeTruthy();

    expect(
      await testCachePredicate(response, {
        responseMatch: async ({ data }) => {
          await 0; // jumps to next nodejs event loop tick
          return data.a;
        }
      })
    ).toBeTruthy();

    expect(
      await testCachePredicate(response, {
        responseMatch: async ({ data }) => {
          await 0; // jumps to next nodejs event loop tick
          return !data.a;
        }
      })
    ).toBeFalsy();

    expect(
      await testCachePredicate(response, {
        statusCheck: async (status) => {
          await 0; // jumps to next nodejs event loop tick
          return status === 399;
        }
      })
    );

    expect(
      await testCachePredicate(response, {
        statusCheck: async (status) => {
          await 0; // jumps to next nodejs event loop tick
          return status !== 399;
        }
      })
    );
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
