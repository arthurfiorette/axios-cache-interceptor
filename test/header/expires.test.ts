import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Header } from '../../src/header/headers.js';
import { defaultHeaderInterpreter } from '../../src/header/interpreter.js';

describe('Expires HTTP Header', () => {
  it('Future Expires', () => {
    const date = new Date(new Date().getFullYear() + 1, 1, 1);

    const result = defaultHeaderInterpreter({
      [Header.Expires]: date.toUTCString()
    });

    const approx = date.getTime() - Date.now();

    assert.notEqual(typeof result, 'string');

    const cache = typeof result === 'number' ? result : Object(result).cache;

    // the result should be what the date is in milliseconds
    // minus the actual epoch milliseconds
    assert.ok(Math.abs(cache - approx) <= 1);
  });

  it('Expires is used when invalid Cache-Control is provided', () => {
    const result = defaultHeaderInterpreter({
      [Header.CacheControl]: '',
      [Header.Expires]: new Date(new Date().getFullYear() - 1, 1, 1).toUTCString()
    });

    assert.equal(result, 'dont cache');
  });

  it('Past Expires', () => {
    const result = defaultHeaderInterpreter({
      [Header.Expires]: new Date(new Date().getFullYear() - 1, 1, 1).toUTCString()
    });

    // Past means cache invalid
    assert.equal(result, 'dont cache');
  });
});
