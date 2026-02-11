# Your First Cache

Create your first cached Axios instance and make cached requests.

## Basic Setup

After [installing the library](/journey/installation.md), you can set up caching with a single function call:

::: code-group

```ts [EcmaScript]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);

// Make your first request
const response = await axios.get('https://api.example.com/users');
console.log(response.cached); // false (first request)
```

```ts [CommonJS]
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const instance = Axios.create();
const axios = setupCache(instance);

// Make your first request
const response = await axios.get('https://api.example.com/users');
console.log(response.cached); // false (first request)
```

```ts [Browser]
const Axios = window.axios;
const { setupCache } = window.AxiosCacheInterceptor;

const instance = Axios.create();
const axios = setupCache(instance);

// Make your first request
const response = await axios.get('https://api.example.com/users');
console.log(response.cached); // false (first request)
```

:::

## Understanding the Setup

The `setupCache()` function:

1. Takes an existing Axios instance
2. Adds caching interceptors
3. Returns the same instance with caching enabled
4. Configures default cache behavior

By default, caching is enabled for:
- GET requests
- HEAD requests
- Successful responses (2xx, 3xx status codes)
- TTL of 5 minutes

## Making Cached Requests

Once set up, make requests as you normally would:

```ts
// First request hits the network
const response1 = await axios.get('/api/users');
console.log(response1.cached); // false

// Second identical request returns cached data
const response2 = await axios.get('/api/users');
console.log(response2.cached); // true
```

## Request Deduplication

The library automatically deduplicates concurrent identical requests:

```ts
// Both requests made at the same time
const [res1, res2] = await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/users')
]);

console.log(res1.cached); // false (went to network)
console.log(res2.cached); // true  (used result from first request)
```

Only one network request is made, and both promises receive the same result.

## Custom Configuration

Customize cache behavior with options:

```ts
const axios = setupCache(instance, {
  ttl: 1000 * 60 * 15, // 15 minutes
  methods: ['get', 'post'], // Also cache POST
  interpretHeader: true, // Respect Cache-Control headers
  debug: console.log // Enable debug logging (development build only)
});
```

## What You Learned

At this point, you can:
- Set up a cached Axios instance
- Make cached requests
- See request deduplication in action
- Customize basic cache behavior

## Next Steps

- [Checking Cache Status](/journey/checking-cache.md) - Understand response properties
- [Persistent Storage](/journey/persistent-storage.md) - Use localStorage instead of memory
- [Invalidate on Mutation](/journey/invalidate-on-mutation.md) - Clear cache after updates
- [API Reference](/api/setup-cache.md) - All configuration options

## Common Questions

**Q: Do I need to change my existing Axios code?**
A: No, existing requests work as-is. Caching happens automatically.

**Q: Will this cache ALL my requests?**
A: Only GET and HEAD requests by default. You can configure which methods to cache.

**Q: What happens to my existing interceptors?**
A: They continue to work. Cache interceptors are added alongside existing ones. See [Other Interceptors](/guide/interceptors.md) for execution order.

**Q: Can I disable caching for specific requests?**
A: Yes, using `cache: { enabled: false }` in the request config.
