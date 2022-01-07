import type { CachedStorageValue } from '../../src/storage/types';
import { isCachePredicateValid } from '../../src/util/cache-predicate';
import { mockAxios } from '../mocks/axios';
import { createResponse } from '../utils';

describe('tests cache predicate object', () => {
  it('tests statusCheck with tuples', () => {
    const response = createResponse({ status: 764 });

    const falsyTest = isCachePredicateValid(response, { statusCheck: [200, 299] });
    const truthyTest = isCachePredicateValid(response, { statusCheck: [760, 769] });

    expect(falsyTest).toBeFalsy();
    expect(truthyTest).toBeTruthy();
  });

  it('tests statusCheck with a predicate', () => {
    const response = createResponse({ status: 764 });

    const falsyTest = isCachePredicateValid(response, {
      statusCheck: (status) => status >= 200 && status <= 299
    });

    const truthyTest = isCachePredicateValid(response, {
      statusCheck: (status) => status >= 760 && status <= 769
    });

    expect(falsyTest).toBeFalsy();
    expect(truthyTest).toBeTruthy();
  });

  it('tests containsHeader with string array', () => {
    const response = createResponse({
      headers: { 'Content-Type': 'application/json' }
    });

    const hasContentTypeLowercase = isCachePredicateValid(response, {
      containsHeaders: { 'content-type': true }
    });

    const hasContentType = isCachePredicateValid(response, {
      containsHeaders: { 'Content-Type': true }
    });

    expect(hasContentTypeLowercase).toBeFalsy();
    expect(hasContentType).toBeTruthy();
  });

  it('tests containsHeader with string tuple', () => {
    const response = createResponse({
      headers: { 'Content-Type': 'application/json' }
    });

    const headerExists = isCachePredicateValid(response, {
      containsHeaders: { 'content-type': 'application/json' }
    });

    const isXmlContent = isCachePredicateValid(response, {
      containsHeaders: { 'Content-Type': 'application/xml' }
    });

    const isJsonContent = isCachePredicateValid(response, {
      containsHeaders: { 'Content-Type': 'application/json' }
    });

    expect(headerExists).toBeFalsy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests containsHeader with string predicate', () => {
    const response = createResponse({
      headers: { 'Content-Type': 'application/json' }
    });

    const headerExists = isCachePredicateValid(response, {
      containsHeaders: { 'content-type': (header) => header == 'application/json' }
    });

    const isXmlContent = isCachePredicateValid(response, {
      containsHeaders: { 'Content-Type': (header) => header == 'application/xml' }
    });

    const isJsonContent = isCachePredicateValid(response, {
      containsHeaders: { 'Content-Type': (header) => header == 'application/json' }
    });

    expect(headerExists).toBeFalsy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests responseMatch', () => {
    const response = createResponse({
      data: { a: true, b: 1 }
    });

    const testStrict = isCachePredicateValid(response, {
      responseMatch: ({ data }) => data && data.a === true && data.b === 1
    });

    const testError = isCachePredicateValid(response, {
      responseMatch: ({ data }) => data && (data.a !== true || data.b !== 1)
    });

    expect(testStrict).toBeTruthy();
    expect(testError).toBeFalsy();
  });

  it('tests generics and typescript types', () => {
    () => {
      const axios = mockAxios();
      axios.get<{ a: boolean; b: number }>('/', {
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
    };
  });
});
