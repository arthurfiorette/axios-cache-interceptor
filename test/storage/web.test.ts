/** @jest-environment jsdom */

import { buildWebStorage } from '../../src/storage/web-api';
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
});
