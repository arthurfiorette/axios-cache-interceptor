import type { CacheStorage, StorageValue } from './types';
import { isCacheValid, canRevalidate } from './util';

/**
 * The key prefix used in WindowStorageWrapper to prevent key
 * collisions with other code.
 */
export const DEFAULT_KEY_PREFIX = 'axios-cache-interceptor';

/**
 * A storage that uses any {@link Storage} as his storage.
 *
 * **Note**: All storage keys used are prefixed with `prefix` value.
 */
export abstract class WindowStorageWrapper implements CacheStorage {
  /**
   * Creates a new instance of WindowStorageWrapper
   *
   * @param storage The storage to interact
   * @param prefix The prefix to use for all keys or
   *   `DEFAULT_KEY_PREFIX` if not provided.
   * @see DEFAULT_KEY_PREFIX
   */
  constructor(readonly storage: Storage, readonly prefix: string = DEFAULT_KEY_PREFIX) {}

  get = async (key: string): Promise<StorageValue> => {
    const prefixedKey = this.prefixKey(key);
    const json = this.storage.getItem(prefixedKey);

    if (!json) {
      return { state: 'empty' };
    }

    const parsed = JSON.parse(json);

    if (isCacheValid(parsed) === false) {
      if (canRevalidate(parsed)) {
        return { ...parsed, state: 'stale' };
      } else {
        return { state: 'empty' };
      }
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
