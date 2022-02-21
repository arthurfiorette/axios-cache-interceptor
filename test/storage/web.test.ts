/** @jest-environment jsdom */

import type { AxiosStorage } from '../../src/storage/types';
import { buildWebStorage } from '../../src/storage/web-api';
import { EMPTY_RESPONSE } from '../utils';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('memory-storage', () => buildWebStorage(new Storage()));
  testStorage('local-storage', () => buildWebStorage(localStorage));
  testStorage('session-storage', () => buildWebStorage(sessionStorage));

  testStorageQuota('local-storage', () => buildWebStorage(localStorage));
  testStorageQuota('session-storage', () => buildWebStorage(sessionStorage));
});

export function testStorageQuota(name: string, Storage: () => AxiosStorage): void {
  it(`tests ${name} storage quota`, async () => {
    const storage = Storage();

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5,
      data: { ...EMPTY_RESPONSE, data: 'data' }
    });

    const result = await storage.get('key');

    expect(result).not.toBeNull();
    expect(result.state).toBe('cached');
    expect(result.data?.data).toBe('data');

    const dataExceedingQuota = '0'.repeat(6000000);

    await storage.set('key', {
      state: 'cached',
      createdAt: Date.now(),
      ttl: 1000 * 60 * 5,
      data: { ...EMPTY_RESPONSE, data: dataExceedingQuota }
    });

    const result2 = await storage.get('key');

    expect(result2).not.toBeNull();
    expect(result2.state).toBe('empty');
  });
}
