/** @jest-environment jsdom */

import { BrowserAxiosStorage } from '../../src/storage/browser';
import { testStorage } from './storages';

describe('tests web storages', () => {
  testStorage('local-storage', () => new BrowserAxiosStorage(localStorage));
  testStorage('session-storage', () => new BrowserAxiosStorage(sessionStorage));
});
