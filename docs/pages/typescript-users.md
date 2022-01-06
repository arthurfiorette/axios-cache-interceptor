# Typescript Users

## The same instance

The `setupCache` function, as previously said, returns the same axios instance but with
**extended** typings.

This means, that by doing that:

```ts
import Axios from 'axios';

const instance = Axios.create();
setupCache(Axios);

await instance.get('url');
```

Is the same as

```ts
import Axios from 'axios';

const axiosInstance = Axios.create();
const instance = setupCache(axiosInstance);

await instance.get('url');
```

But you'll see that the second example has a type of `AxiosCacheInstance` instead of
`AxiosInstance`. This means that the `cache` property at every request is only available
at the `AxiosCacheInstance` type.

That's why it is better to save `setupCache` return value in a variable and use it instead
of the original axios instance.

## With global axios

If you need, for some reason, apply the interceptor to the global axios instance, you
won't be able to simply use the newer properties and configurations.

You can re-export the global axios instance in the same file you defined the interceptor,
example:

```ts
// axios-config.ts

import axios, { AxiosStatic } from 'axios';
import { setupCache, type AxiosCacheInstance } from 'axios-cache-interceptor';

setupCache(axios);

export default axios as AxiosCacheInstance & AxiosStatic;
```

```ts
// some file

// import axios from 'axios';
import axios from './axios-config';

// works
axios.get('url', {
  cache: {
    ttl: 60
  }
});
```
