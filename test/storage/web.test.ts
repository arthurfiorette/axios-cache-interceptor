/** @jest-environment jsdom */

import { buildWebStorage } from '../../src/storage/web-api';
import { mockAxios } from '../mocks/axios';
import { testStorageQuota } from './quota';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', () => buildWebStorage(localStorage));
  testStorage('session-storage', () => buildWebStorage(sessionStorage));

  testStorageQuota('local-storage', () => localStorage);
  testStorageQuota('session-storage', () => sessionStorage);

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('Should use a key prefix by default', async () => {
    const storage = sessionStorage; // does not matter any implementation details

    storage.setItem('test-key', '1');

    const axios = mockAxios({
      storage: buildWebStorage(storage)
    });

    await axios.get('url', {
      id: 'test-key'
    });

    expect(storage.getItem('test-key')).toBe('1');
    expect(axios.storage.get('test-key')).not.toBe('1');
  });
});
