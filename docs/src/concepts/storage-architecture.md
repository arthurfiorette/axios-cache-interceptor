# Storage Architecture

Understanding the storage interface and implementation patterns.

## Storage Interface

All storage adapters implement:

```ts
interface AxiosStorage {
  get(key: string): MaybePromise<StorageValue | undefined>;
  set(key: string, value: NotEmptyStorageValue): MaybePromise<void>;
  remove(key: string): MaybePromise<void>;
  clear?(): MaybePromise<void>;
}
```

## Built-in Implementations

### Memory Storage

Default in-memory storage:

```ts
import { buildMemoryStorage } from 'axios-cache-interceptor';

const storage = buildMemoryStorage({
  maxEntries: 100,       // Limit cache size
  maxStaleAge: 3600000,  // Auto-clean stale entries
  cleanupInterval: 300000, // Periodic cleanup
  clone: false           // Clone data to prevent mutations
});
```

Features:
- JavaScript Map for O(1) lookups
- FIFO eviction when maxEntries reached
- Periodic cleanup of stale entries
- Optional data cloning

### Web Storage

Browser localStorage/sessionStorage:

```ts
import { buildWebStorage } from 'axios-cache-interceptor';

const storage = buildWebStorage(localStorage, {
  prefix: 'axios-cache:', // Key prefix
  maxStaleAge: 86400000   // 24 hours
});
```

Features:
- JSON serialization
- Quota exceeded handling
- Automatic eviction on quota errors
- Prefix support for namespacing

## Custom Storage

Implement for specialized backends:

```ts
import { buildStorage } from 'axios-cache-interceptor';

const customStorage = buildStorage({
  async find(key) {
    return await myDB.get(key);
  },

  async set(key, value) {
    await myDB.set(key, value);
  },

  async remove(key) {
    await myDB.delete(key);
  },

  async clear() {
    await myDB.clear();
  }
});
```

## Storage Value Types

Storage must handle all these states:

```ts
type StorageValue =
  | { state: 'empty' }
  | { state: 'cached'; data: any; ttl: number; createdAt: number }
  | { state: 'stale'; data: any; ttl: number; createdAt: number }
  | { state: 'loading'; previous: 'empty' | 'stale' | 'must-revalidate' };
```

## Eviction Strategies

### FIFO (First In, First Out)

Memory storage default:
```ts
if (entries.size >= maxEntries) {
  const firstKey = entries.keys().next().value;
  entries.delete(firstKey);
}
```

### LRU (Least Recently Used)

Track access time:
```ts
const lruStorage = buildStorage({
  async find(key) {
    const value = cache.get(key);
    if (value) {
      // Update access time
      accessTimes.set(key, Date.now());
    }
    return value;
  },

  async set(key, value) {
    if (cache.size >= maxEntries) {
      // Evict least recently used
      const lruKey = findLRU();
      cache.delete(lruKey);
    }
    cache.set(key, value);
  }
});
```

## Performance Considerations

**Memory:**
- O(1) for get/set/remove
- Memory proportional to cache size
- Clone option doubles memory usage

**Web Storage:**
- Synchronous API (blocks main thread)
- JSON serialization overhead
- 5-10MB typical limit

**Custom Storage:**
- Async operations non-blocking
- Network latency for remote storage
- Larger capacity possible

## Next Steps

- [Storage Interface API](/api/storage-interface.md) - Complete reference
- [Custom Storage Guide](/journey/custom-storage.md) - Implementation guide
- [Storage States](/concepts/storage-states.md) - Value types explained
