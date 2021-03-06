## Configuration

This library preserves 100% the original `Axios API`, so after applying it with
[`setupCache()`](pages/usage-examples#applying), your code won't change or break.

See all properties and their default values.

```js
import {
  setupCache,
  buildMemoryStorage,
  defaultKeyGenerator,
  defaultHeaderInterpreter
} from 'axios-cache-interceptor';

const axios = setupCache(
  // axios instance
  Axios.create(),

  // All options with their default values
  {
    // The storage to save the cache data. There are more available by default.
    //
    // https://axios-cache-interceptor.js.org/#/pages/storages
    storage: buildMemoryStorage(),

    // The mechanism to generate a unique key for each request.
    //
    // https://axios-cache-interceptor.js.org/#/pages/request-id
    generateKey: defaultKeyGenerator,

    // The mechanism to interpret headers (when cache.interpretHeader is true).
    //
    // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=headerinterpreter
    headerInterpreter: defaultHeaderInterpreter,

    // The function that will receive debug information.
    // NOTE: For this to work, you need to enable development mode.
    //
    // https://axios-cache-interceptor.js.org/#/pages/development-mode
    // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=debug
    debug: undefined
  }
);
```

And each configuration property can be overridden at request level:

```js
const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1', {
  // All per-request options lives under the `cache` property.
  cache: {
    // The time until the cached value is expired in milliseconds.
    ttl: 1000 * 60 * 5,

    // If the request should configure the cache based on some standard cache headers, Like
    // Cache-Control, Expires and so on...
    interpretHeader: false,

    // All methods that should activate cache behaviors. If the method is not in this list,
    // it will be completely ignored.
    methods: ['get'],

    // A predicate object that will be used in each request to determine if the request can
    // be cached or not.
    //
    // https://axios-cache-interceptor.js.org/#/pages/per-request-configuration?id=cachecachepredicate
    cachePredicate: {
      statusCheck: (status) => status >= 200 && status < 400
    },

    // All requests that should have their cache updated once this request is resolved.
    // Normally used to update similar requests or records with newer data.
    //
    // https://axios-cache-interceptor.js.org/#/pages/per-request-configuration?id=cacheupdate
    update: {},

    // If the support for ETag and If-None-Match headers is active. You can use a string to
    // force a custom value for the ETag response.
    //
    etag: false,

    // If we should interpret the If-Modified-Since header when generating a TTL value.
    modifiedSince: false,

    // If we should return a old (possibly expired) cache when the current request failed
    // to get a valid response because of a network error, invalid status or etc.
    staleIfError: false
  }
});
```
