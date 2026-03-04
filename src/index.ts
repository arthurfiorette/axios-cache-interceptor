export * from './cache/axios.ts';
export * from './cache/cache.ts';
export * from './cache/create.ts';
export * from './header/headers.ts';
export * from './header/interpreter.ts';
export * from './header/types.ts';
export * from './interceptors/build.ts';
export * from './interceptors/request.ts';
export * from './interceptors/response.ts';
export * from './interceptors/util.ts';
export * from './storage/build.ts';
export * from './storage/memory.ts';
export * from './storage/types.ts';
export * from './storage/web-api.ts';
export * from './util/cache-predicate.ts';
export * from './util/key-generator.ts';
export * from './util/types.ts';
export * from './util/update-cache.ts';

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
