import { AxiosStorage } from './storage';
import type { NotEmptyStorageValue, StorageValue } from './types';

export class MemoryAxiosStorage extends AxiosStorage {
  constructor(readonly storage: Record<string, StorageValue> = {}) {
    super();
  }

  public find = async (key: string): Promise<StorageValue> => {
    return this.storage[key] || { state: 'empty' };
  };

  public set = async (key: string, value: NotEmptyStorageValue): Promise<void> => {
    this.storage[key] = value;
  };

  public remove = async (key: string): Promise<void> => {
    delete this.storage[key];
  };
}
