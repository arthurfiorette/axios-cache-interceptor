import assert from 'node:assert';
import { it } from 'node:test';
import type { AxiosStorage } from '../../src/storage/types';
import { EMPTY_RESPONSE, mockDateNow } from '../utils';

export function testStorage(name: string, storage: AxiosStorage): void {
  it(`${name} storage methods`, async () => {
    const result = await storage.get('key');

    assert.notEqual(result, null);
    assert.equal(result.state, 'empty');

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5,
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    const result2 = await storage.get('key');

    assert.notEqual(result2, null);
    assert.equal(result2.state, 'cached');
    assert.equal(result2.data?.data, 'data');

    await storage.remove('key');

    const result3 = await storage.get('key');

    assert.notEqual(result3, null);
    assert.equal(result3.state, 'empty');
  });

  it(`${name} storage staling`, async () => {
    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5, // 5 Minutes
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    const result = await storage.get('key');

    assert.notEqual(result, null);
    assert.equal(result.state, 'cached');
    assert.equal(result.data?.data, 'data');

    // Advance 6 minutes in time
    mockDateNow(1000 * 60 * 6);

    const result2 = await storage.get('key');

    assert.notEqual(result2, null);
    assert.equal(result2.state, 'empty');
  });
}
