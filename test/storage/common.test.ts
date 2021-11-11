import { MemoryAxiosStorage } from '../../src/storage/memory';
import { testStorage } from './storages';

describe('tests common storages', () => {
  testStorage('memory', () => new MemoryAxiosStorage());
});
