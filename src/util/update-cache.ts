import type { AxiosStorage } from '../storage/storage';
import type {
  CachedStorageValue,
  LoadingStorageValue,
  StorageValue
} from '../storage/types';

export type CacheUpdater =
  | 'delete'
  | ((
      cached: Exclude<StorageValue, LoadingStorageValue>,
      newData: any
    ) => CachedStorageValue | void);

/** Function to update all caches, from CacheProperties.update, with the new data. */
export async function updateCache<T = any>(
  storage: AxiosStorage,
  data: T,
  entries: Record<string, CacheUpdater>
): Promise<void> {
  for (const cacheKey in entries) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = entries[cacheKey]!;

    if (value === 'delete') {
      await storage.remove(cacheKey);
      continue;
    }

    const oldValue = await storage.get(cacheKey);

    if (oldValue.state === 'loading') {
      throw new Error('cannot update the cache while loading');
    }

    const newValue = value(oldValue, data);

    if (newValue === undefined) {
      await storage.remove(cacheKey);
      continue;
    }

    await storage.set(cacheKey, newValue);
  }
}
