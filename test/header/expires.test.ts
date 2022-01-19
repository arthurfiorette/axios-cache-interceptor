import { Header } from '../../src/header/headers';
import { defaultHeaderInterpreter } from '../../src/header/interpreter';

describe('test Expires header', () => {
  it('tests with future expires', () => {
    const date = new Date(new Date().getFullYear() + 1, 1, 1);

    const result = defaultHeaderInterpreter({
      [Header.Expires]: date.toUTCString()
    });

    const approx = date.getTime() - Date.now();

    expect(typeof result).toBe('number');

    if (typeof result !== 'number') {
      return expect(true).toBeFalsy();
    }

    // the result should be what the date is in milliseconds
    // minus the actual epoch milliseconds
    expect(Math.abs(result - approx)).toBeLessThanOrEqual(1);
  });

  it('expects Expires to be used when invalid Cache-Control is provided', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: '',
      [Header.Expires]: new Date(new Date().getFullYear() - 1, 1, 1).toUTCString()
    });

    expect(result).toBe('dont cache');
  });

  it('tests with past expires', () => {
    const result = defaultHeaderInterpreter({
      [Header.Expires]: new Date(new Date().getFullYear() - 1, 1, 1).toUTCString()
    });

    // Past means cache invalid
    expect(result).toBe('dont cache');
  });
});
