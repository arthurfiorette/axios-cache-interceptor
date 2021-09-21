/**
 * @jest-environment jsdom
 */

import { LocalCacheStorage, SessionCacheStorage } from '../../src/storage/web';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', () => new LocalCacheStorage());
  testStorage('session-storage', () => new SessionCacheStorage());
});
