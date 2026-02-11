# Basic Setup Examples

Minimal configuration examples to get started quickly.

## Simplest Setup

The absolute minimum to enable caching:

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create());

// That's it! Caching is now enabled for GET and HEAD requests
const response = await axios.get('/api/users');
console.log(response.cached); // true on second call
```

## With Custom TTL

Set a custom cache duration:

```ts
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create(), {
  ttl: 1000 * 60 * 15 // 15 minutes
});
```

## CommonJS

For Node.js projects using CommonJS:

```js
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const axios = setupCache(Axios.create());

async function fetchUsers() {
  const response = await axios.get('/api/users');
  return response.data;
}
```

## Browser UMD

For browser usage without a bundler:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js"></script>
</head>
<body>
  <script>
    const axios = AxiosCacheInterceptor.setupCache(window.axios.create());

    axios.get('/api/users').then(response => {
      console.log('Cached:', response.cached);
      console.log('Data:', response.data);
    });
  </script>
</body>
</html>
```

## TypeScript

With full type safety:

```ts
import Axios from 'axios';
import { setupCache, type AxiosCacheInstance } from 'axios-cache-interceptor';

interface User {
  id: number;
  name: string;
  email: string;
}

const axios: AxiosCacheInstance = setupCache(Axios.create());

async function getUsers(): Promise<User[]> {
  const response = await axios.get<User[]>('/api/users');
  return response.data;
}
```

## Debug Mode

Enable logging for development:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(Axios.create(), {
  debug: console.log
});
```

## Next Steps

- [Opt-in Cache](/examples/opt-in-cache.md) - Selective caching pattern
- [Persistent Storage](/journey/persistent-storage.md) - Use localStorage
