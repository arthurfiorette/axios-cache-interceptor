/** Index file for webpack and cdn usage */

export { createCache, setupCache, useCache } from './cache/create';
export { BrowserAxiosStorage } from './storage/browser';
export { MemoryAxiosStorage } from './storage/memory';
export { AxiosStorage } from './storage/storage';

console.warn(
  'You are using a development build. Make sure to use the correct build in production\nhttps://github.com/arthurfiorette/axios-cache-interceptor#installing'
);
