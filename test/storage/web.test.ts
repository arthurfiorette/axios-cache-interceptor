import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { buildWebStorage } from '../../src/storage/web-api';
import { localStorage, sessionStorage } from '../dom';
import { mockAxios } from '../mocks/axios';
import { testStorageQuota } from './quota';
import { testStorage } from './storages';

describe('Web Storages', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  testStorage('LocalStorage', buildWebStorage(localStorage));
  testStorage('SessionStorage', buildWebStorage(sessionStorage));

  testStorageQuota('LocalStorage', localStorage);
  testStorageQuota('SessionStorage', sessionStorage);

  it('Should use a key prefix by default', async () => {
    const storage = sessionStorage; // does not matter any implementation details

    storage.setItem('test-key', '1');

    const axios = mockAxios({
      storage: buildWebStorage(storage)
    });

    await axios.get('url', {
      id: 'test-key'
    });

    assert.equal(storage.getItem('test-key'), '1');
    assert.notEqual(await axios.storage.get('test-key'), '1');
  });
});
