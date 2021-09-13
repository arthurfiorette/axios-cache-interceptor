import { Deferred } from '../../src/util/deferred';

describe('Tests cached status code', () => {
  it('test resolve method', () => {
    const deferred = new Deferred();

    expect(deferred).resolves.toBe(1);
    deferred.resolve(1);
  });

  it('test reject method', () => {
    const deferred = new Deferred();

    expect(deferred).rejects.toBe(1);
    deferred.reject(1);
  });

  it('test then method', () => {
    const deferred = new Deferred();

    deferred.then((data) => {
      expect(data).toBe(1);
    });

    deferred.resolve(1);
  });

  it('test catch method', () => {
    const deferred = new Deferred();

    deferred.catch((data) => {
      expect(data).toBe(1);
    });

    deferred.resolve(1);
  });

  it('test finally method', () => {
    const deferred = new Deferred<number>();

    let data: number;
    deferred.then((d) => {
      data = d;
    });

    deferred.finally(() => {
      expect(data).toBe(1);
    });

    deferred.resolve(1);
  });
});
