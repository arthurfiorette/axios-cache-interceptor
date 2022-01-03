import { createValidateStatus } from '../../src/interceptors/util';

describe('test util functions', () => {
  it('tests validate-status function', async () => {
    const def = createValidateStatus();
    expect(def(200)).toBe(true);
    expect(def(345)).toBe(false);
    expect(def(304)).toBe(true);

    const only200 = createValidateStatus((s) => s >= 200 && s < 300);
    expect(only200(200)).toBe(true);
    expect(only200(299)).toBe(true);
    expect(only200(304)).toBe(true);
    expect(only200(345)).toBe(false);

    const randomValue = createValidateStatus((s) => s >= 405 && s <= 410);
    expect(randomValue(200)).toBe(false);
    expect(randomValue(404)).toBe(false);
    expect(randomValue(405)).toBe(true);
    expect(randomValue(304)).toBe(true);
  });
});
