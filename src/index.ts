export * from './cache/axios.js';
export * from './cache/cache.js';
export * from './cache/create.js';
export * from './header/headers.js';
export * from './header/interpreter.js';
export * from './header/types.js';
export * from './interceptors/build.js';
export * from './interceptors/request.js';
export * from './interceptors/response.js';
export * from './interceptors/util.js';
export * from './storage/build.js';
export * from './storage/memory.js';
export * from './storage/types.js';
export * from './storage/web-api.js';
export * from './util/cache-predicate.js';
export * from './util/key-generator.js';
export * from './util/types.js';
export * from './util/update-cache.js';

/** @internal */
declare global {
  /**
   * **This declaration is erased at compile time.**
   *
   * Use to write code that will only be executed at development time.
   *
   * @internal
   */
  const __ACI_DEV__: boolean;
}

if (__ACI_DEV__) {
  console.error(
    'You are using a development build. Make sure to use the correct build in production\nhttps://axios-cache-interceptor.js.org/guide/getting-started\n\n'
  );
}
