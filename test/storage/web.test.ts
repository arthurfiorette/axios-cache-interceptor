/** @jest-environment jsdom */

import { buildWebStorage } from '../../src/storage/web-api';
import { testStorage, testStorageQuota } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', () => buildWebStorage(localStorage));
  testStorage('session-storage', () => buildWebStorage(sessionStorage));
  testStorageQuota('local-storage', () => buildWebStorage(localStorage));
  testStorageQuota('session-storage', () => buildWebStorage(sessionStorage));
});
