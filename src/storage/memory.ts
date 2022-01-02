import { buildStorage } from './build';
import type { StorageValue } from './types';

export function buildMemoryStorage(obj: Record<string, StorageValue> = {}) {
  return buildStorage({
    find: (key) => Promise.resolve(obj[key]),
    set: (key, value) => Promise.resolve(void (obj[key] = value)),
    remove: (key) => Promise.resolve(void delete obj[key])
  });
}
