# Stale Data Served

Fix issues with outdated or expired cached data being returned.

## Symptoms

- Old data displayed to users
- Changes not reflected after mutations
- Data doesn't update even after TTL should expire

## Diagnostic Steps

### 1. Check TTL Configuration

**Problem:** TTL might be too long.

**Check:**
```ts
const response = await axios.get('/api/users');
const cache = await axios.storage.get(response.id);
console.log('TTL:', cache.ttl); // In milliseconds
console.log('Created:', new Date(cache.createdAt));
console.log('Age:', Date.now() - cache.createdAt);
```

**Solution:**
```ts
// Reduce TTL
await axios.get('/api/users', {
  cache: { ttl: 1000 * 60 } // 1 minute instead of 5
});
```

### 2. Check Header Interpretation

**Problem:** Server headers might set long max-age.

**Check:**
```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});

// Look for: "Cache header interpreted as <number>"
```

**Solution:**
```ts
// Ignore server headers
cache: {
  interpretHeader: false,
  ttl: 1000 * 60 * 5
}
```

### 3. Check If Override Needed

**Problem:** Need to force fresh data.

**Solution:**
```ts
// Force fresh request but still cache response
await axios.get('/api/users', {
  cache: { override: true }
});
```

### 4. Check Cache State

**Problem:** Cache might be in stale state but still served.

**Check:**
```ts
const response = await axios.get('/api/users');
console.log('Stale:', response.stale);

const cache = await axios.storage.get(response.id);
console.log('State:', cache.state); // Should be 'stale' if expired
```

**Solution:**
```ts
// Disable stale-if-error if you don't want stale data
cache: { staleIfError: false }
```

## Common Causes

### Long TTL

**Fix:**
```ts
const axios = setupCache(instance, {
  ttl: 1000 * 60 * 5 // 5 minutes, not 1 hour
});
```

### Server max-age

**Fix:**
```ts
cache: {
  interpretHeader: false,
  ttl: 1000 * 60 * 5
}
```

### Missing Invalidation

**Fix:**
```ts
await axios.post('/api/users', data, {
  cache: {
    update: {
      'users-list': 'delete' // Invalidate related cache
    }
  }
});
```

### Clock Skew

**Problem:** Expires header with server time different from client.

**Fix:**
```ts
// Use TTL instead of Expires header
cache: { interpretHeader: false }
```

## Force Fresh Data

### Per-Request Override

```ts
// Get fresh data, update cache
await axios.get('/api/users', {
  cache: { override: true }
});
```

### Clear Specific Cache

```ts
// Clear cache for this endpoint
const response = await axios.get('/api/users');
await axios.storage.remove(response.id);

// Or by custom ID
await axios.storage.remove('users-list');
```

### Clear All Cache

```ts
// Clear everything
await axios.storage.clear?.();
```

## Prevent Stale Data

### Dynamic TTL

```ts
await axios.get('/api/data', {
  cache: {
    ttl: (response) => {
      // Shorter TTL for frequently changing data
      if (response.data.volatile) {
        return 1000 * 30; // 30 seconds
      }
      // Longer TTL for static data
      return 1000 * 60 * 60; // 1 hour
    }
  }
});
```

### ETag Revalidation

```ts
// Enable automatic revalidation
const axios = setupCache(instance, {
  etag: true, // Enabled by default
  modifiedSince: false
});
```

### Programmatic Updates

```ts
// Update cache instead of deleting
await axios.post('/api/users', newUser, {
  cache: {
    update: {
      'users-list': (cache, response) => {
        if (cache.state === 'cached') {
          cache.data.push(response.data);
          return cache;
        }
        return 'delete';
      }
    }
  }
});
```

## Next Steps

- [Preventing Stale Data](/journey/preventing-stale-data.md) - TTL strategies
- [Invalidate on Mutation](/journey/invalidate-on-mutation.md) - Cache management
- [HTTP Headers](/concepts/http-caching-headers.md) - Header interpretation
