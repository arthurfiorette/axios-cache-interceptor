import type { AxiosResponse } from 'axios';
import { checkPredicateObject } from '../../src/util/cache-predicate';

const Response = <R>(config: Partial<AxiosResponse<R>>): AxiosResponse<R> => {
  return {
    status: 200,
    headers: {},
    config: {},
    data: {} as R,
    statusText: '',
    request: {},
    ...config
  };
};

describe('tests cache predicate object', () => {
  it('tests statusCheck with tuples', () => {
    const response = Response({ status: 764 });

    const falsyTest = checkPredicateObject(response, { statusCheck: [200, 299] });
    const truthyTest = checkPredicateObject(response, { statusCheck: [760, 769] });

    expect(falsyTest).toBeFalsy();
    expect(truthyTest).toBeTruthy();
  });

  it('tests statusCheck with a predicate', () => {
    const response = Response({ status: 764 });

    const falsyTest = checkPredicateObject(response, {
      statusCheck: (status) => status >= 200 && status <= 299
    });

    const truthyTest = checkPredicateObject(response, {
      statusCheck: (status) => status >= 760 && status <= 769
    });

    expect(falsyTest).toBeFalsy();
    expect(truthyTest).toBeTruthy();
  });

  it('tests containsHeader with string array', () => {
    const response = Response({
      headers: { 'Content-Type': 'application/json' }
    });

    const hasContentTypeLowercase = checkPredicateObject(response, {
      containsHeaders: { 'content-type': true }
    });

    const hasContentType = checkPredicateObject(response, {
      containsHeaders: { 'Content-Type': true }
    });

    expect(hasContentTypeLowercase).toBeFalsy();
    expect(hasContentType).toBeTruthy();
  });

  it('tests containsHeader with string tuple', () => {
    const response = Response({
      headers: { 'Content-Type': 'application/json' }
    });

    const headerExists = checkPredicateObject(response, {
      containsHeaders: { 'content-type': 'application/json' }
    });

    const isXmlContent = checkPredicateObject(response, {
      containsHeaders: { 'Content-Type': 'application/xml' }
    });

    const isJsonContent = checkPredicateObject(response, {
      containsHeaders: { 'Content-Type': 'application/json' }
    });

    expect(headerExists).toBeFalsy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests containsHeader with string predicate', () => {
    const response = Response({
      headers: { 'Content-Type': 'application/json' }
    });

    const headerExists = checkPredicateObject(response, {
      containsHeaders: { 'content-type': (header) => header == 'application/json' }
    });

    const isXmlContent = checkPredicateObject(response, {
      containsHeaders: { 'Content-Type': (header) => header == 'application/xml' }
    });

    const isJsonContent = checkPredicateObject(response, {
      containsHeaders: { 'Content-Type': (header) => header == 'application/json' }
    });

    expect(headerExists).toBeFalsy();
    expect(isXmlContent).toBeFalsy();
    expect(isJsonContent).toBeTruthy();
  });

  it('tests responseMatch', () => {
    const response = Response({
      data: { a: true, b: 1 }
    });

    const testStrict = checkPredicateObject(response, {
      responseMatch: (data: any) => data && data.a === true && data.b === 1
    });

    const testError = checkPredicateObject(response, {
      responseMatch: (data: any) => data && (data.a !== true || data.b !== 1)
    });

    expect(testStrict).toBeTruthy();
    expect(testError).toBeFalsy();
  });
});
