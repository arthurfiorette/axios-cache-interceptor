export * from './cache/axios';
export * from './cache/cache';
export * from './cache/create';
export * from './header/headers';
export * from './header/interpreter';
export * from './header/types';
export * from './interceptors/build';
export * from './interceptors/request';
export * from './interceptors/response';
export * from './interceptors/util';
export * from './storage/build';
export * from './storage/memory';
export * from './storage/types';
export * from './storage/web-api';
export * from './util/cache-predicate';
export * from './util/key-generator';
export * from './util/types';
export * from './util/update-cache';

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
