import { AxiosStorage } from './storage';
import type { EmptyStorageValue, StorageValue } from './types';

export class BrowserAxiosStorage extends AxiosStorage {
  public static DEFAULT_KEY_PREFIX = 'a-c-i';

  /**
   * @param storage any browser storage, like sessionStorage or localStorage
   * @param prefix the key prefix to use on all keys.
   */
  constructor(
    readonly storage: Storage,
    readonly prefix: string = BrowserAxiosStorage.DEFAULT_KEY_PREFIX
  ) {
    super();
  }

  public get = (key: string): StorageValue => {
    const prefixedKey = `${this.prefix}:${key}`;

    const json = this.storage.getItem(prefixedKey);

    if (!json) {
      return { state: 'empty' };
    }

    const parsed = JSON.parse(json);

    if (!AxiosStorage.isValid(parsed)) {
      this.storage.removeItem(prefixedKey);
      return { state: 'empty' };
    }

    return parsed;
  };

  public set = (key: string, value: Exclude<StorageValue, EmptyStorageValue>): void => {
    return this.storage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
  };

  public remove = (key: string): void | Promise<void> => {
    return this.storage.removeItem(`${this.prefix}:${key}`);
  };
}
