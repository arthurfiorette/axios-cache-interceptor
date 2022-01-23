# Development

For development, debug and testing purposes, you can opt to use the **Development mode**.

It brings some extra features to our built code, like the `debug` option, source maps,
fewer code and etc.

You can enable it basically by using `/dev` at the end of the import path.

```js
import { setupCache } from 'axios-cache-interceptor/esm/dev';
const { setupCache } = require('axios-cache-interceptor/umd/dev');

// https://cdn.jsdelivr.net/npm/axios-cache-interceptor/umd/dev.js
const { setupCache } = window.AxiosCacheInterceptor;
```

## Debug option

The debug option will print debug information in the console. It is good if you need to
trace any undesired behavior or issue.

You can enable it by setting `debug` to a function that receives an string.

```js
// Will print debug info in the console.
setupCache(axios, {
  debug: console.log
});

// own logger or whatever.
setupCache(axios, {
  debug: (message) => {
    // Etc
    myCustomLogger.emit({
      key: 'axios-cache-interceptor',
      log: message
    });
  }
});

// Disables debug.
setupCache(axios, {
  debug: undefined
});
// or
axiosCacheInstance.debug = undefined;
```
