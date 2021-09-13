import { MemoryStorage } from '../../src/storage';
import { testStorage } from './storages';

describe('tests common storages', () => {
  testStorage('memory', MemoryStorage);
});
