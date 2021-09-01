import { CacheStorage, StorageValue } from './types';
/**
 * A storage that uses any {@link Storage} as his storage.
 */
export abstract class WindowStorageWrapper implements CacheStorage {
  constructor(
    readonly storage: Storage,
    readonly prefix: string = 'axios-cache:'
  ) {}

  get = async (key: string): Promise<StorageValue> => {
    const json = this.storage.getItem(this.prefix + key);
    return json
      ? JSON.parse(json)
      : { data: null, expiration: -1, state: 'empty' };
  };

  set = async (key: string, value: StorageValue): Promise<void> => {
    const json = JSON.stringify(value);
    this.storage.setItem(this.prefix + key, json);
  };

  remove = async (key: string): Promise<void> => {
    this.storage.removeItem(this.prefix + key);
  };
}

export class LocalCacheStorage extends WindowStorageWrapper {
  constructor(prefix?: string) {
    super(window.localStorage, prefix);
  }
}

export class SessionCacheStorage extends WindowStorageWrapper {
  constructor(prefix?: string) {
    super(window.sessionStorage, prefix);
  }
}
