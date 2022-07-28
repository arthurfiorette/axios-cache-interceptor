import type { CacheAxiosResponse } from '../cache/axios';
import type { AxiosStorage } from '../storage/types';
import type { CacheUpdater } from './types';

/** Function to update all caches, from CacheProperties.update, with the new data. */
export async function updateCache<R, D>(
  storage: AxiosStorage,
  data: CacheAxiosResponse<R, D>,
  cacheUpdater: CacheUpdater<R, D>
): Promise<void> {
  // Global cache update function.
  if (typeof cacheUpdater === `function`) {
    return cacheUpdater(data);
  }

  for (const [cacheKey, updater] of Object.entries(cacheUpdater)) {
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
