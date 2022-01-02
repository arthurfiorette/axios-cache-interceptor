/** Index file for webpack and cdn usage */

export {
  createCache,
  isAxiosCacheInterceptor,
  setupCache,
  useCache
} from './cache/create';
export { buildStorage } from './storage/build';
export { buildMemoryStorage } from './storage/memory';
export { buildWebStorage } from './storage/web-api';
