import { AxiosCacheInstance, CacheProperties } from '../axios';

export async function updateCache(
  axios: AxiosCacheInstance,
  data: any,
  entries: CacheProperties['update']
) {
  for (const [cacheKey, value] of Object.entries(entries)) {
    if (value == 'delete') {
      await axios.storage.remove(cacheKey);
      continue;
    }

    const oldValue = await axios.storage.get(cacheKey);
    const newValue = value(oldValue, data);

    if (newValue === undefined) {
      await axios.storage.remove(cacheKey);
      continue;
    }

    await axios.storage.set(cacheKey, newValue);
  }
}
