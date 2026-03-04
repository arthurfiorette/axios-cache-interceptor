# Custom Storage

Build your own storage adapter for specialized caching needs.

## Storage Interface

All storage adapters implement the `AxiosStorage` interface:

```ts
interface AxiosStorage {
  get(key: string): MaybePromise<StorageValue | undefined>;
  set(key: string, value: NotEmptyStorageValue): MaybePromise<void>;
  remove(key: string): MaybePromise<void>;
  clear?(): MaybePromise<void>; // Optional
}
```

## Using buildStorage Helper

The `buildStorage()` helper creates a storage adapter from simple functions:

```ts
import { buildStorage } from 'axios-cache-interceptor';

const myStorage = buildStorage({
  async find(key) {
    // Return stored value or undefined
    const value = await myDatabase.get(key);
    return value;
  },

  async set(key, value) {
    // Store the value
    await myDatabase.set(key, value);
  },

  async remove(key) {
    // Delete the entry
    await myDatabase.delete(key);
  },

  async clear() {
    // Optional: clear all entries
    await myDatabase.clear();
  }
});

// Use it
const axios = setupCache(instance, { storage: myStorage });
```

## Storage Value Types

Understand the different storage states:

```ts
type StorageValue =
  | { state: 'empty' }
  | { state: 'cached'; data: CachedResponse; ttl: number; createdAt: number }
  | { state: 'stale'; data: CachedResponse; ttl: number; createdAt: number }
  | { state: 'loading'; previous: 'empty' | 'stale' | 'must-revalidate' };
```

Your storage must handle all these states correctly.

## Complete Example: Redis

A complete Redis storage implementation:

```ts
import { buildStorage } from 'axios-cache-interceptor';
import Redis from 'ioredis';

const redis = new Redis();

const redisStorage = buildStorage({
  async find(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : undefined;
  },

  async set(key, value) {
    const serialized = JSON.stringify(value);

    // Calculate expiration for Redis
    if (value.state === 'cached' || value.state === 'stale') {
      const ttl = Math.ceil(value.ttl / 1000); // Convert ms to seconds
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async remove(key) {
    await redis.del(key);
  },

  async clear() {
    await redis.flushdb();
  }
});

export default redisStorage;
```

## Complete Example: IndexedDB

Browser-side persistent storage with larger capacity:

```ts
import { buildStorage } from 'axios-cache-interceptor';
import { openDB } from 'idb';

const dbPromise = openDB('axios-cache', 1, {
  upgrade(db) {
    db.createObjectStore('cache');
  }
});

const indexedDBStorage = buildStorage({
  async find(key) {
    const db = await dbPromise;
    return await db.get('cache', key);
  },

  async set(key, value) {
    const db = await dbPromise;
    await db.put('cache', value, key);
  },

  async remove(key) {
    const db = await dbPromise;
    await db.delete('cache', key);
  },

  async clear() {
    const db = await dbPromise;
    await db.clear('cache');
  }
});

export default indexedDBStorage;
```

## Handling TTL and Expiration

If your storage backend supports auto-expiration (like Redis):

```ts
async set(key, value) {
  if (value.state === 'cached' || value.state === 'stale') {
    // Calculate when the entry should expire
    const ttlSeconds = Math.ceil(value.ttl / 1000);

    // For stale entries, you may want longer expiration
    // since they can be revalidated
    const actualTTL = value.state === 'stale'
      ? ttlSeconds * 2 // Keep stale entries longer
      : ttlSeconds;

    await redis.setex(key, actualTTL, JSON.stringify(value));
  }
}
```

## Error Handling

Handle storage errors gracefully:

```ts
const safeStorage = buildStorage({
  async find(key) {
    try {
      return await myDatabase.get(key);
    } catch (error) {
      console.error('Storage read error:', error);
      return undefined; // Treat as cache miss
    }
  },

  async set(key, value) {
    try {
      await myDatabase.set(key, value);
    } catch (error) {
      console.error('Storage write error:', error);
      // Fail silently - caching is degraded but app continues
    }
  },

  async remove(key) {
    try {
      await myDatabase.delete(key);
    } catch (error) {
      console.error('Storage delete error:', error);
    }
  }
});
```

## Testing Storage

Test your storage implementation:

```ts
import { buildStorage } from 'axios-cache-interceptor';
import { describe, it, expect } from 'vitest';

describe('Custom Storage', () => {
  const storage = buildStorage({ /* your implementation */ });

  it('should store and retrieve values', async () => {
    const value = {
      state: 'cached' as const,
      data: { /* cached response */ },
      ttl: 60000,
      createdAt: Date.now()
    };

    await storage.set('test-key', value);
    const retrieved = await storage.get('test-key');

    expect(retrieved).toEqual(value);
  });

  it('should return undefined for missing keys', async () => {
    const result = await storage.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should remove entries', async () => {
    await storage.set('test-key', someValue);
    await storage.remove('test-key');
    const result = await storage.get('test-key');

    expect(result).toBeUndefined();
  });
});
```

## Next Steps

- [Storage Architecture](/concepts/storage-architecture.md) - How storage works internally
- [Storage Interface API](/api/storage-interface.md) - Complete interface reference
- [Redis Example](/examples/redis-storage.md) - Production-ready Redis implementation
- [IndexedDB Example](/examples/indexeddb-storage.md) - Browser persistent storage
