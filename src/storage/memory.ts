import type { CacheStorage, StorageValue } from './types';

export class MemoryStorage implements CacheStorage {
  private readonly storage: Map<string, StorageValue> = new Map();

  get = async (key: string): Promise<StorageValue> => {
    const value = this.storage.get(key);

    if (!value) {
      return { state: 'empty' };
    }

    if (value.state === 'cached' && value.createdAt + value.ttl < Date.now()) {
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
