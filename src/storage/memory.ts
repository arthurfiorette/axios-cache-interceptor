import { AxiosStorage } from './storage';
import type { NotEmptyStorageValue, StorageValue } from './types';

export class MemoryAxiosStorage extends AxiosStorage {
  constructor(readonly storage: Record<string, StorageValue> = {}) {
    super();
  }

  readonly find = async (key: string): Promise<StorageValue> => {
    return this.storage[key] || { state: 'empty' };
  };

  readonly set = async (key: string, value: NotEmptyStorageValue): Promise<void> => {
    this.storage[key] = value;
  };

  readonly remove = async (key: string): Promise<void> => {
    delete this.storage[key];
  };
}
