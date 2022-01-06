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

console.warn(
  'You are using a development build. Make sure to use the correct build in production\nhttps://axios-cache-interceptor.js.org/pages/installing'
);
