import type { CacheStorage, StorageValue } from './types';
import { isCacheValid } from './util';

/**
 * A storage that uses any {@link Storage} as his storage.
 */
export abstract class WindowStorageWrapper implements CacheStorage {
  constructor(readonly storage: Storage, readonly prefix: string = DEFAULT_KEY_PREFIX) {}

  get = async (key: string): Promise<StorageValue> => {
    const prefixedKey = this.prefixKey(key);
    const json = this.storage.getItem(prefixedKey);

    if (!json) {
      return { state: 'empty' };
    }

    const parsed = JSON.parse(json);

    if (!isCacheValid(parsed)) {
      this.storage.removeItem(prefixedKey);
      return { state: 'empty' };
    }

    return parsed;
  };

  set = async (key: string, value: StorageValue): Promise<void> => {
    const json = JSON.stringify(value);
    this.storage.setItem(this.prefixKey(key), json);
  };

  remove = async (key: string): Promise<void> => {
    this.storage.removeItem(this.prefixKey(key));
  };

  private prefixKey = (key: string): string => `${this.prefix}:${key}`;
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

export const DEFAULT_KEY_PREFIX = 'axios-cache-interceptor';
