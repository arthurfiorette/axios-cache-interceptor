/**
 * @jest-environment jsdom
 */

import { LocalCacheStorage, SessionCacheStorage } from '../../src/storage';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', LocalCacheStorage);
  testStorage('session-storage', SessionCacheStorage);
});
