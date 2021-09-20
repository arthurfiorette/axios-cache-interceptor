import { deferred } from '../../src/util/deferred';

describe('Tests cached status code', () => {
  it('test resolve method', () => {
    const d = deferred();

    expect(d).resolves.toBe(1);
    d.resolve(1);
  });

  it('test reject method', () => {
    const d = deferred();

    expect(d).rejects.toBe(1);
    d.reject(1);
  });

  it('test then method', () => {
    const d = deferred();

    d.then((data) => {
      expect(data).toBe(1);
    });

    d.resolve(1);
  });

  it('test catch method', () => {
    const d = deferred();

    d.catch((data) => {
      expect(data).toBe(1);
    });

    d.resolve(1);
  });

  it('test finally method', () => {
    const d = deferred<number, any>();

    let data: number;
    d.then((d) => {
      data = d;
    });

    d.finally(() => {
      expect(data).toBe(1);
    });

    d.resolve(1);
  });

  it('test with try catch', async () => {
    const d = deferred<number, any>();

    process.nextTick(d.resolve, 1);

    let data: number;
    try {
      data = await d;
    } catch (err) {
      data = 2;
    }

    expect(data).toBe(1);
  });
});
