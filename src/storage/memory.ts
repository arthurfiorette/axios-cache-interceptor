import type { CacheStorage, StorageValue } from './types';
import { isCacheValid } from './util';

export class MemoryStorage implements CacheStorage {
  private readonly storage: Map<string, StorageValue> = new Map();

  get = async (key: string): Promise<StorageValue> => {
    const value = this.storage.get(key);

    if (!value) {
      return { state: 'empty' };
    }

    if (isCacheValid(value) === false) {
      this.remove(key);
      return { state: 'empty' };
    }

    return value;
  };

  set = async (key: string, value: StorageValue): Promise<void> => {
    this.storage.set(key, value);
  };

  remove = async (key: string): Promise<void> => {
    this.storage.delete(key);
  };
}
