# Global Configuration

When applying the interceptor, you can customize some properties:

```js
const axios = setupCache(axios, {
  // Properties here
});
```

## `storage`

The storage used to save the cache. Defaults to a simple in-memory storage.
[See more about storages](pages/storages).

## `generateKey`

The function used to create different keys for each request. Defaults to a function that
priorizes the id, and if not specified, a string is generated using the `method`,
`baseURL`, `params`, `data` and `url`.

The
[default](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/src/util/key-generator.ts)
id generation can clarify this idea.

## `waiting`

A simple object that will hold a promise for each pending request. Used to handle
concurrent requests.

Can also be used as type of _listener_ to know when a request is finished.

## `headerInterpreter`

The function used to interpret all headers from a request and determine a time to live
(`ttl`) number.

The possible returns are:

- `'dont cache'`: the request will not be cached
- `'not enough headers'`: the request will find other ways to determine the ttl
- `number`: this will be the ttl value.

Example

```ts
// Typescript example!

import { setupCache, type HeaderInterpreter } from 'axios-cache-interceptor';

const myHeaderInterpreter: HeaderInterpreter = (headers) => {
  if (headers['x-my-custom-header']) {
    const seconds = Number(headers['x-my-custom-header']);

    if (seconds < 1) {
      return 'dont cache';
    }

    return seconds;
  }

  return 'not enough headers';
};
```

## `request` and `response` Interceptors

These functions intercepts and modify the axios logic and objects. If you are using some
sort of custom implementation, it is not guaranteed to any other documented thing work.

At this moment, you can see their code for more information
[here](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors).
