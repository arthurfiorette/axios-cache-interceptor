import type { AxiosCacheInstance, CacheUpdater } from '../axios/types';

export async function updateCache(
  axios: AxiosCacheInstance,
  data: any,
  entries: Record<string, CacheUpdater>
): Promise<void> {
  for (const cacheKey in entries) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = entries[cacheKey]!;

    if (value == 'delete') {
      await axios.storage.remove(cacheKey);
      continue;
    }

    const oldValue = await axios.storage.get(cacheKey);

    if (oldValue.state === 'loading') {
      throw new Error('cannot update the cache while loading');
    }

    const newValue = value(oldValue, data);

    if (newValue === undefined) {
      await axios.storage.remove(cacheKey);
      continue;
    }

    await axios.storage.set(cacheKey, newValue);
  }
}
