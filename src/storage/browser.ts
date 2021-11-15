import type { NotEmptyStorageValue } from '..';
import { AxiosStorage } from './storage';
import type { StorageValue } from './types';

export class BrowserAxiosStorage extends AxiosStorage {
  public static DEFAULT_KEY_PREFIX = 'a-c-i';

  /**
   * @param storage Any browser storage, like sessionStorage or localStorage
   * @param prefix The key prefix to use on all keys.
   */
  constructor(
    readonly storage: Storage,
    readonly prefix: string = BrowserAxiosStorage.DEFAULT_KEY_PREFIX
  ) {
    super();
  }

  public find = async (key: string): Promise<StorageValue> => {
    const json = this.storage.getItem(`${this.prefix}:${key}`);
    return json ? JSON.parse(json) : { state: 'empty' };
  };

  public set = async (key: string, value: NotEmptyStorageValue): Promise<void> => {
    return this.storage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
  };

  public remove = async (key: string): Promise<void> => {
    return this.storage.removeItem(`${this.prefix}:${key}`);
  };
}
