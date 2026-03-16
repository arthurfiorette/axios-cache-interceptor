# Production Checklist

Pre-deployment considerations for axios-cache-interceptor in production.

## Build Configuration

**Use production build:**

```ts
// Production
import { setupCache } from 'axios-cache-interceptor';

// NOT development build in production
// import { setupCache } from 'axios-cache-interceptor/dev';
```

The production build:
- Removes all debug code
- Is smaller (4.4KB gzipped)
- Has better performance

## Storage Configuration

**Choose appropriate storage:**

```ts
// Server-side: Use Redis or similar
import { setupCache } from 'axios-cache-interceptor';
import redisStorage from './storage/redis';

const axios = setupCache(instance, {
  storage: redisStorage
});

// Browser: Use localStorage for persistence
import { buildWebStorage } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  storage: buildWebStorage(localStorage)
});

// In-memory: Set limits
import { buildMemoryStorage } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  storage: buildMemoryStorage({
    maxEntries: 100,           // Prevent unbounded growth
    maxStaleAge: 3600000,      // 1 hour cleanup
    cleanupInterval: 300000    // 5 minutes
  })
});
```

## Memory Management

**Set appropriate limits:**

```ts
const axios = setupCache(instance, {
  storage: buildMemoryStorage({
    maxEntries: 100,        // Limit cache size
    maxStaleAge: 3600000,   // Auto-clean stale entries
    cleanupInterval: 300000 // Periodic cleanup
  })
});
```

## Error Handling

**Configure stale-if-error:**

```ts
const axios = setupCache(instance, {
  staleIfError: true // Return stale cache on network errors
});
```

**Handle storage errors:**

```ts
const axios = setupCache(instance, {
  storage: buildStorage({
    async find(key) {
      try {
        return await storage.get(key);
      } catch (error) {
        // Log error but don't crash
        console.error('Cache read error:', error);
        return undefined;
      }
    },
    // ... other methods with try/catch
  })
});
```

## Security Considerations

**Avoid caching sensitive data:**

```ts
const axios = setupCache(instance, {
  cachePredicate: {
    ignoreUrls: [
      /\/auth\//,          // Don't cache auth endpoints
      /\/payment\//,       // Don't cache payment data
      /\/personal\//       // Don't cache PII
    ]
  }
});
```

**Enable Vary header handling:**

```ts
const axios = setupCache(instance, {
  vary: true // Prevent cache poisoning with different headers
});
```

## Performance Optimization

**Set appropriate TTLs:**

```ts
const axios = setupCache(instance, {
  // Default TTL
  ttl: 1000 * 60 * 5, // 5 minutes

  // Per-endpoint overrides
});

// Static data - longer TTL
await axios.get('/api/categories', {
  cache: { ttl: 1000 * 60 * 60 } // 1 hour
});

// Dynamic data - shorter TTL
await axios.get('/api/prices', {
  cache: { ttl: 1000 * 30 } // 30 seconds
});
```

**Enable header interpretation:**

```ts
const axios = setupCache(instance, {
  interpretHeader: true // Let server control caching
});
```

## Monitoring

**Add monitoring:**

```ts
const axios = setupCache(instance, {
  // Production-safe logging
  debug: process.env.NODE_ENV === 'development'
    ? console.log
    : undefined
});

// Custom metrics
let cacheHits = 0;
let cacheMisses = 0;

axios.interceptors.response.use((response) => {
  if (response.cached) {
    cacheHits++;
  } else {
    cacheMisses++;
  }

  // Report to monitoring service
  metrics.gauge('cache_hit_rate', cacheHits / (cacheHits + cacheMisses));

  return response;
});
```

## Testing

**Test cache behavior:**

```ts
// Test suite
describe('Cache Behavior', () => {
  it('should cache GET requests', async () => {
    const res1 = await axios.get('/api/users');
    const res2 = await axios.get('/api/users');

    expect(res1.cached).toBe(false);
    expect(res2.cached).toBe(true);
  });

  it('should invalidate after mutation', async () => {
    await axios.post('/api/users', data, {
      cache: { update: { 'users-list': 'delete' } }
    });

    const cache = await axios.storage.get('users-list');
    expect(cache.state).toBe('empty');
  });
});
```

## Deployment Checklist

**Before deploying:**

- [ ] Using production build (not /dev)
- [ ] Storage configured appropriately
- [ ] Memory limits set
- [ ] Error handling in place
- [ ] Sensitive endpoints excluded from cache
- [ ] Vary header handling enabled
- [ ] TTLs configured per endpoint
- [ ] Monitoring/metrics in place
- [ ] Tests passing
- [ ] Cache invalidation strategy tested

## Environment-Specific Configuration

```ts
const config = {
  development: {
    debug: console.log,
    ttl: 1000 * 10, // Short TTL for development
    storage: buildMemoryStorage()
  },
  production: {
    debug: undefined,
    ttl: 1000 * 60 * 5,
    storage: process.env.REDIS_URL
      ? redisStorage
      : buildMemoryStorage({ maxEntries: 500 })
  }
};

const axios = setupCache(instance, config[process.env.NODE_ENV]);
```

## Next Steps

- [Examples](/examples/) - Production-ready examples
- [Monitoring Guide](/concepts/performance-model.md) - Performance characteristics
- [Security Best Practices](/concepts/vary-header-handling.md) - Prevent cache poisoning
