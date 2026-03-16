# Troubleshooting

Having issues with caching? This section provides problem-solution guides for common issues.

## Common Issues

Quick links to the most common problems:

- [Cache Not Working](./cache-not-working.md) - Request not being cached
- [Stale Data Served](./stale-data-served.md) - Receiving expired data
- [Memory Leaks](./memory-leaks.md) - High memory consumption
- [Cache Poisoning](./cache-poisoning.md) - Wrong data for different users
- [CORS Errors](./cors-errors.md) - CORS issues with cacheTakeover
- [Concurrent Request Issues](./concurrent-issues.md) - Deduplication problems
- [TypeScript Errors](./typescript-errors.md) - Type-related issues

## Diagnostic Approach

When debugging cache issues, follow this systematic approach:

### 1. Enable Debug Mode

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});
```

### 2. Check Response Properties

```ts
const response = await axios.get('/api/data');
console.log({
  cached: response.cached,
  stale: response.stale,
  id: response.id
});
```

### 3. Inspect Storage State

```ts
const cache = await axios.storage.get(response.id);
console.log(cache.state); // 'empty', 'cached', 'stale', 'loading'
```

### 4. Review Configuration

Check that your configuration matches your expectations:
- Is the HTTP method in `cache.methods`?
- Does the status code pass `cachePredicate.statusCheck`?
- Are headers saying "don't cache" (Cache-Control: no-cache)?
- Is the URL in `ignoreUrls`?

## Quick Fixes

### Cache Not Working

```ts
// Check method
cache: { methods: ['get', 'post'] }

// Check status codes
cache: {
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 300
  }
}

// Disable header interpretation if needed
cache: { interpretHeader: false }
```

### Stale Data

```ts
// Reduce TTL
cache: { ttl: 60000 } // 1 minute

// Force fresh data
cache: { override: true }
```

### Memory Issues

```ts
// Limit cache size
buildMemoryStorage({ maxEntries: 100 })

// Clean up stale entries
buildMemoryStorage({ maxStaleAge: 3600000 }) // 1 hour
```

## Getting Help

If these guides don't solve your issue:

1. Check the [API Reference](/api/) for correct usage
2. Review [Core Concepts](/concepts/) for understanding
3. Search [GitHub Issues](https://github.com/arthurfiorette/axios-cache-interceptor/issues)
4. Ask on [Discord](https://discord.gg/arthurfiorette)
5. Open a new GitHub issue with debug logs

## Related Resources

- [Debugging Guide](/journey/debugging-issues.md) - Systematic debugging approach
- [Common Patterns](/examples/) - See working examples
- [Core Concepts](/concepts/) - Understand the internals
