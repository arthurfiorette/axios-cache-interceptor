# Persistent Storage

Use localStorage or sessionStorage to persist cache across page reloads.

## Why Persistent Storage?

By default, axios-cache-interceptor uses in-memory storage, which is cleared when the page reloads. Persistent storage allows:

- Cache survival across page reloads
- Reduced bandwidth on repeat visits
- Offline-first experiences
- Faster initial page loads

## Using localStorage

Store cache in localStorage for persistence across sessions:

```ts
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  storage: buildWebStorage(localStorage)
});
```

Now cache persists even after closing the browser.

## Using sessionStorage

Store cache for the current session only:

```ts
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  storage: buildWebStorage(sessionStorage)
});
```

Cache is cleared when the browser tab is closed.

## Configuration Options

Customize web storage behavior:

```ts
const axios = setupCache(instance, {
  storage: buildWebStorage(localStorage, {
    prefix: 'my-app-cache:', // Key prefix (default: 'axios-cache:')
    maxStaleAge: 1000 * 60 * 60 * 24 * 7 // Keep stale entries for 7 days
  })
});
```

## Storage Quota Management

Web storage has size limits. The library handles quota exceeded errors automatically by evicting old entries:

1. Removes all expired entries
2. Removes oldest entry
3. Retries save
4. Repeats until success

## Complete Example

```ts
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

// Create cached instance with localStorage
const axios = setupCache(Axios.create(), {
  storage: buildWebStorage(localStorage, {
    prefix: 'my-app:',
    maxStaleAge: 1000 * 60 * 60 * 24 // 1 day
  }),
  ttl: 1000 * 60 * 15 // 15 minutes
});

// First visit: fetch from network
const res1 = await axios.get('/api/users');
console.log(res1.cached); // false

// Reload the page...

// Second visit: served from localStorage
const res2 = await axios.get('/api/users');
console.log(res2.cached); // true
```

## Storage Limitations

**localStorage/sessionStorage Limitations:**
- Typically 5-10MB size limit
- Synchronous API (blocks main thread)
- Shared across all tabs (localStorage only)
- String serialization required

For larger datasets, consider [IndexedDB Storage](/examples/indexeddb-storage.md).

## Clearing Storage

Clear all cached data:

```ts
// Clear all cache entries
await axios.storage.clear?.();

// Or clear localStorage directly
localStorage.clear();
```

## TypeScript Types

The storage adapter is fully typed:

```ts
import type { AxiosStorage } from 'axios-cache-interceptor';

const storage: AxiosStorage = buildWebStorage(localStorage);
```

## Next Steps

- [Custom Storage](/journey/custom-storage.md) - Build your own storage adapter
- [IndexedDB Example](/examples/indexeddb-storage.md) - Use IndexedDB for larger data
- [Redis Example](/examples/redis-storage.md) - Server-side persistent storage
- [Storage Architecture](/concepts/storage-architecture.md) - How storage works
