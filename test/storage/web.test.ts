/** @jest-environment jsdom */

import { buildWebStorage } from '../../src/storage/web-api';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', () => buildWebStorage(sessionStorage));
  testStorage('session-storage', () => buildWebStorage(sessionStorage));
});
