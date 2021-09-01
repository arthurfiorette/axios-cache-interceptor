import { CacheStorage, StorageValue } from './types';

const emptyValue: StorageValue = {
  data: null,
  expires: -1,
  state: 'empty'
};

export class MemoryStorage implements CacheStorage {
  readonly storage: Map<string, StorageValue> = new Map();

  get = async (key: string): Promise<StorageValue> => {
    const value = this.storage.get(key);

    if (value) {
      return value;
    }

    // Fresh copy to prevent code duplication
    const empty = { ...emptyValue };

    this.storage.set(key, empty);
    return empty;
  };

  set = async (key: string, value: StorageValue): Promise<void> => {
    this.storage.set(key, value);
  };

  remove = async (key: string): Promise<void> => {
    this.storage.delete(key);
  };

  size = async (): Promise<number> => {
    return this.storage.size;
  };

  clear = async (): Promise<void> => {
    this.storage.clear();
  };
}
