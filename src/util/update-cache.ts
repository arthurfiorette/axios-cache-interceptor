import type { CacheAxiosResponse } from '../cache/axios';
import type { AxiosStorage } from '../storage/types';
import type { CacheUpdater } from './types';

/** Function to update all caches, from CacheProperties.update, with the new data. */
export async function updateCache<T, D>(
  storage: AxiosStorage,
  data: CacheAxiosResponse<T, D>,
  entries: Record<string, CacheUpdater<T, D>>
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
      continue;
    }

    const newValue = await value(oldValue, data);

    if (newValue === 'delete') {
      await storage.remove(cacheKey);
      continue;
    }

    if (newValue === 'ignore') {
      continue;
    }

    await storage.set(cacheKey, newValue);
  }
}
