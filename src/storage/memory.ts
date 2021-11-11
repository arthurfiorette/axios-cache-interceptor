import { AxiosStorage } from './storage';
import type { CachedStorageValue, LoadingStorageValue, StorageValue } from './types';

export class MemoryAxiosStorage extends AxiosStorage {
  constructor(readonly storage: Record<string, StorageValue> = {}) {
    super();
  }

  public get = (key: string): StorageValue => {
    const value = this.storage[key];

    if (!value) {
      return { state: 'empty' };
    }

    if (!AxiosStorage.isValid(value)) {
      this.remove(key);
      return { state: 'empty' };
    }

    return value;
  };

  public set = (key: string, value: CachedStorageValue | LoadingStorageValue): void => {
    this.storage[key] = value;
  };

  public remove = (key: string): void => {
    delete this.storage[key];
  };
}
