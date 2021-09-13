import { CacheStorage, StorageValue } from './types';
/**
 * A storage that uses any {@link Storage} as his storage.
 */
export abstract class WindowStorageWrapper implements CacheStorage {
  constructor(readonly storage: Storage, readonly prefix: string = 'axios-cache:') {}

  get = async (_key: string): Promise<StorageValue> => {
    const key = this.prefix + _key;
    const json = this.storage.getItem(key);

    if (!json) {
      return { state: 'empty' };
    }

    const parsed = JSON.parse(json);

    if (parsed.state === 'cached' && parsed.createdAt + parsed.ttl < Date.now()) {
      this.storage.removeItem(key);
      return { state: 'empty' };
    }

    return parsed;
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
    super(window.localStorage || localStorage, prefix);
  }
}

export class SessionCacheStorage extends WindowStorageWrapper {
  constructor(prefix?: string) {
    super(window.sessionStorage, prefix);
  }
}
