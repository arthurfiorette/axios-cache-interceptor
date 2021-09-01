import { WindowStorageWrapper } from './wrapper';

export class LocalCacheStorage extends WindowStorageWrapper {
  constructor(prefix?: string) {
    super(window.localStorage, prefix);
  }
}

export class SessionCacheStorage extends WindowStorageWrapper {
  constructor(prefix?: string) {
    super(window.sessionStorage, prefix);
  }
}
