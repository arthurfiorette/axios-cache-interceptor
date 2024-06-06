import assert from 'node:assert';
import { describe, it } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import type { CachedStorageValue } from '../../src/storage/types.js';
import { testCachePredicate } from '../../src/util/cache-predicate.js';
import { mockAxios } from '../mocks/axios.js';
import { createResponse } from '../utils.js';

describe('CachePredicate', () => {
  it('Empty usage', () => {
    const response = createResponse({ status: 200 });

    assert.ok(testCachePredicate(response, {}));
  });

  it('Capital Cased headers', async () => {
    const response = createResponse({ headers: { 'Content-Type': 'application/json' } });

    assert.ok(
      await testCachePredicate(response, {
        containsHeaders: {
          'Content-Type': (h) => h === 'application/json'
        }
      })
    );
  });

  it('StatusCheck with a predicate', async () => {
    const response = createResponse({ status: 764 });

    assert.equal(
      await testCachePredicate(response, {
        statusCheck: (status) => status >= 200 && status <= 299
      }),
      false
    );

    assert.ok(
      await testCachePredicate(response, {
        statusCheck: (status) => status >= 760 && status <= 769
      })
    );
  });

  it('ContainsHeader header casing', async () => {
    const response = createResponse({
      headers: { 'content-type': 'application/json' }
    });

    assert.ok(await testCachePredicate(response, {}));

    assert.equal(
      await testCachePredicate(response, {
        containsHeaders: { 'content-type': () => false }
      }),
      false
    );

    assert.equal(
      await testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => false }
      }),
      false
    );

    assert.equal(
      await testCachePredicate(response, {
        containsHeaders: { 'Content-Type': () => false }
      }),
      false
    );
  });

  it('ContainsHeader', async () => {
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

    assert.equal(isXmlContent, false);
    assert.ok(isJsonLowercase);
    assert.ok(isJsonContent);
  });

  it('ContainsHeader with string predicate', async () => {
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

    assert.ok(headerExists);
    assert.equal(isXmlContent, false);
    assert.ok(isJsonContent);
  });

  it('ResponseMatch', async () => {
    const response = createResponse({
      data: { a: true, b: 1 }
    });

    assert.ok(
      await testCachePredicate(response, {
        responseMatch: ({ data }) => data && data.a === true && data.b === 1
      })
    );

    assert.ok(
      await testCachePredicate(response, ({ data }) => data && data.a === true && data.b === 1)
    );

    assert.equal(
      await testCachePredicate(response, {
        responseMatch: ({ data }) => data && (data.a !== true || data.b !== 1)
      }),
      false
    );
  });

  it('ResponseMath, ContainsHeaders with async functions', async () => {
    const response = createResponse({
      data: { a: true, b: 1 },
      status: 399,
      headers: { 'cache-control': 'no-cache' }
    });

    assert.equal(
      await testCachePredicate(response, {
        containsHeaders: {
          'cache-control': async (h) => {
            await setImmediate(); // jumps to next nodejs event loop tick
            return h !== 'no-cache';
          }
        }
      }),
      false
    );

    assert.ok(
      await testCachePredicate(response, {
        containsHeaders: {
          'cache-control': async (header) => {
            await setImmediate(); // jumps to next nodejs event loop tick
            return header === 'no-cache';
          }
        }
      })
    );

    assert.ok(
      await testCachePredicate(response, {
        responseMatch: async ({ data }) => {
          await setImmediate(); // jumps to next nodejs event loop tick
          return data.a;
        }
      })
    );

    assert.equal(
      await testCachePredicate(response, {
        responseMatch: async ({ data }) => {
          await setImmediate(); // jumps to next nodejs event loop tick
          return !data.a;
        }
      }),
      false
    );

    assert.ok(
      await testCachePredicate(response, {
        statusCheck: async (status) => {
          await setImmediate(); // jumps to next nodejs event loop tick
          return status === 399;
        }
      })
    );

    assert.equal(
      await testCachePredicate(response, {
        statusCheck: async (status) => {
          await setImmediate(); // jumps to next nodejs event loop tick
          return status !== 399;
        }
      }),
      false
    );
  });

  it('Generics and Typescript types', async () => {
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
          id: (_, { data: { a, b }, headers, status, statusText }): CachedStorageValue => {
            return {
              state: 'cached',
              ttl: Number.MAX_SAFE_INTEGER,
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

    assert.ok(result);
  });

  it('Request always have id', async () => {
    const axios = mockAxios({
      methods: ['post'] // only post
    });

    const req1 = await axios.post('url', { a: 1 });
    const req2 = await axios.post('url', { a: 1 });

    const req3 = await axios.get('url-2');

    assert.ok(req1.id);
    assert.equal(req1.cached, false);
    assert.equal(req1.stale, undefined);
    
    assert.ok(req2.id);
    assert.equal(req2.cached, true);
    assert.equal(req2.stale, false);
    
    assert.ok(req3.id);
    assert.equal(req3.cached, false);
    assert.equal(req3.stale, undefined);
  });
});
