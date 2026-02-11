# Debugging Issues

Systematic approach to diagnosing and fixing cache problems.

## Enable Debug Mode

The development build includes comprehensive debugging:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});
```

This logs:
- Cache hits and misses
- Concurrent request deduplication
- Header interpretation decisions
- Storage operations
- Vary header mismatches

## Check Response Properties

Inspect cache-specific properties:

```ts
const response = await axios.get('/api/users');

console.log({
  cached: response.cached,  // Was this from cache?
  stale: response.stale,    // Is the data stale?
  id: response.id           // Cache key
});
```

## Inspect Storage State

Check what's actually in the cache:

```ts
const response = await axios.get('/api/users');
const cache = await axios.storage.get(response.id);

console.log(cache);
// {
//   state: 'cached' | 'stale' | 'loading' | 'empty',
//   data: {...},      // Only if state is 'cached' or 'stale'
//   createdAt: ...,
//   ttl: ...
// }
```

## Common Issues Checklist

**Cache not working?**

- Is the method in `cache.methods`? (default: `['get', 'head']`)
- Does status code pass `cachePredicate.statusCheck`?
- Are server headers saying "don't cache"? (Cache-Control: no-cache)
- Is the URL in `ignoreUrls`?
- Is `cache.enabled` false?

**Stale data served?**

- Is TTL too long?
- Is `interpretHeader` reading old Cache-Control max-age?
- Clock skew causing Expires calculation issues?
- Need `override: true` for fresh data?

**Memory issues?**

- Is `cleanupInterval` disabled?
- Is `maxEntries` too high or disabled?
- Are stale entries accumulating?
- Is custom storage implementing cleanup?

**Wrong data returned (cache poisoning)?**

- Is `vary: false` when server uses Vary header?
- Is custom key generator not including all factors?
- Are you mutating cached data without `cloneData`?

## Debug Mode Output

Example debug output:

```
[1847392847] Cache miss { url: '/api/users', method: 'GET' }
[1847392847] Making network request
[1847392847] Cache header interpreted as 300000
[1847392847] Response cached { ttl: 300000, state: 'cached' }
[1847392847] Cache hit { url: '/api/users', method: 'GET' }
[1847392847] Vary mismatch detected { expected: [...], got: [...] }
```

## Debugging Concurrent Requests

Check if requests are being dedupl

icated:

```ts
console.log('Starting concurrent requests...');

const [res1, res2] = await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/users')
]);

console.log({
  res1_cached: res1.cached, // false
  res2_cached: res2.cached, // true - deduplication worked
  same_id: res1.id === res2.id // true
});
```

## Debugging Header Interpretation

See how headers affect caching:

```ts
const axios = setupCache(instance, {
  debug: (msg) => {
    if (msg.msg?.includes('header')) {
      console.log('Header interpretation:', msg);
    }
  }
});
```

## Debugging Storage

Test storage directly:

```ts
// Manually check storage
const cache = await axios.storage.get('some-cache-key');
console.log('Storage state:', cache.state);

// Manually set cache
await axios.storage.set('test-key', {
  state: 'cached',
  data: { /* response data */ },
  ttl: 60000,
  createdAt: Date.now()
});

// Verify it was stored
const retrieved = await axios.storage.get('test-key');
console.log('Retrieved:', retrieved);
```

## Production Debugging

For production, use conditional debugging:

```ts
const axios = setupCache(instance, {
  debug: process.env.DEBUG_CACHE
    ? console.log
    : undefined
});
```

Or custom logging:

```ts
const axios = setupCache(instance, {
  debug: (msg) => {
    // Send to logging service
    logger.debug('axios-cache', {
      id: msg.id,
      message: msg.msg,
      data: msg.data
    });
  }
});
```

## Next Steps

- [Troubleshooting Index](/troubleshooting/) - Problem-specific guides
- [Cache Not Working](/troubleshooting/cache-not-working.md) - Diagnostic checklist
- [Core Concepts](/concepts/how-it-works.md) - Understand internals
- [Debug API](/api/setup-cache.md#debug) - Complete debug reference
