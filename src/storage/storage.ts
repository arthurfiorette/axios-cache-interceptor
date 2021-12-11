import type { CachedStorageValue, NotEmptyStorageValue } from '..';
import { Header } from '../util/headers';
import type { StaleStorageValue, StorageValue } from './types';

export abstract class AxiosStorage {
  /**
   * Returns the cached value for the given key. The get method is what takes care to
   * invalidate the values.
   */
  protected abstract readonly find: (key: string) => Promise<StorageValue>;

  /**
   * Sets a new value for the given key
   *
   * Use CacheStorage.remove(key) to define a key to 'empty' state.
   */
  abstract readonly set: (key: string, value: NotEmptyStorageValue) => Promise<void>;

  /** Removes the value for the given key */
  abstract readonly remove: (key: string) => Promise<void>;

  readonly get = async (key: string): Promise<StorageValue> => {
    const value = await this.find(key);

    if (
      value.state !== 'cached' ||
      // Cached and fresh value
      value.createdAt + value.ttl > Date.now()
    ) {
      return value;
    }

    // Check if his can stale value.
    if (AxiosStorage.keepIfStale(value)) {
      const stale: StaleStorageValue = {
        data: value.data,
        state: 'stale',
        createdAt: value.createdAt
      };
      await this.set(key, stale);
      return stale;
    }

    await this.remove(key);
    return { state: 'empty' };
  };

  /** Returns true if a invalid cache should still be kept */
  static readonly keepIfStale = ({ data }: CachedStorageValue): boolean => {
    if (data?.headers) {
      return (
        Header.ETag in data.headers ||
        Header.LastModified in data.headers ||
        Header.XAxiosCacheEtag in data.headers ||
        Header.XAxiosCacheLastModified in data.headers
      );
    }

    return false;
  };
}
