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
    const updater = entries[cacheKey]!;

    if (updater === 'delete') {
      await storage.remove(cacheKey, data.config);
      continue;
    }

    const value = await storage.get(cacheKey, data.config);

    if (value.state === 'loading') {
      continue;
    }

    const newValue = await updater(value, data);

    if (newValue === 'delete') {
      await storage.remove(cacheKey, data.config);
      continue;
    }

    if (newValue !== 'ignore') {
      await storage.set(cacheKey, newValue, data.config);
    }
  }
}
