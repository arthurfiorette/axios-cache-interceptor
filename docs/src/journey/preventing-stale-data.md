# Preventing Stale Data

Configure TTL, revalidation, and header interpretation to keep your cache fresh.

## Understanding TTL

TTL (Time To Live) determines how long data stays fresh in cache:

```ts
const axios = setupCache(instance, {
  ttl: 1000 * 60 * 15 // 15 minutes
});
```

After TTL expires, the next request fetches fresh data from the network.

## Per-Request TTL

Override TTL for specific endpoints:

```ts
// Short TTL for frequently changing data
await axios.get('/api/live-prices', {
  cache: { ttl: 1000 * 30 } // 30 seconds
});

// Long TTL for static data
await axios.get('/api/categories', {
  cache: { ttl: 1000 * 60 * 60 } // 1 hour
});
```

## Dynamic TTL

Calculate TTL based on response data:

```ts
await axios.get('/api/data', {
  cache: {
    ttl: (response) => {
      // Use server-provided expiration
      if (response.data.expiresIn) {
        return response.data.expiresIn * 1000;
      }

      // Default to 5 minutes
      return 1000 * 60 * 5;
    }
  }
});
```

## HTTP Header Interpretation

Let the server control caching with HTTP headers:

```ts
const axios = setupCache(instance, {
  interpretHeader: true // Enabled by default
});
```

The library respects these headers:
- `Cache-Control: max-age=3600`
- `Cache-Control: no-cache`
- `Cache-Control: no-store`
- `Expires: Wed, 21 Oct 2026 07:28:00 GMT`
- `Age: 300`

Example server response:

```http
HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "abc123"
```

This data will be cached for 1 hour, regardless of your TTL configuration.

## Disabling Header Interpretation

For servers that send restrictive cache headers:

```ts
await axios.get('/api/data', {
  cache: {
    interpretHeader: false, // Ignore server headers
    ttl: 1000 * 60 * 10     // Use this TTL instead
  }
});
```

## ETag Revalidation

Use ETag for efficient revalidation:

```ts
const axios = setupCache(instance, {
  etag: true // Enabled by default
});
```

**How it works:**

1. First request:
   ```
   GET /api/users
   → Server responds with ETag: "abc123"
   ```

2. After cache expires:
   ```
   GET /api/users
   If-None-Match: "abc123"
   → Server responds 304 Not Modified (data unchanged)
   ```

3. Library keeps existing cache, extends TTL

## If-Modified-Since

Alternative to ETag for older servers:

```ts
const axios = setupCache(instance, {
  etag: false,
  modifiedSince: true
});
```

Works similarly to ETag but uses timestamps.

## Force Fresh Data

Override cache and fetch fresh data:

```ts
// Ignore cache, but still cache the new response
await axios.get('/api/users', {
  cache: { override: true }
});

// vs completely disable caching
await axios.get('/api/users', {
  cache: { enabled: false }
});
```

## Stale While Revalidate

Serve stale cache while fetching fresh data in the background:

```ts
// Server response header
Cache-Control: max-age=600, stale-while-revalidate=86400
```

This allows the library to:
1. Serve stale cache immediately
2. Make background request for fresh data
3. Update cache when fresh data arrives

## Hydrate Pattern

Update UI with stale data while fetching fresh:

```ts
await axios.get('/api/users', {
  cache: {
    hydrate: (cachedData) => {
      // Update UI with stale data immediately
      updateUI(cachedData.data);
    }
  }
});
// After await: UI updated again with fresh data
```

## Cache Invalidation on Error

Control whether to return stale cache on errors:

```ts
const axios = setupCache(instance, {
  staleIfError: true // Return stale cache on network errors
});

// Or configure per-request
await axios.get('/api/critical', {
  cache: {
    staleIfError: false // Don't use stale on errors for this endpoint
  }
});
```

## TTL Best Practices

**Frequently changing data** (seconds to minutes):
```ts
cache: { ttl: 1000 * 30 } // 30 seconds
```

**Semi-static data** (minutes to hours):
```ts
cache: { ttl: 1000 * 60 * 15 } // 15 minutes
```

**Static data** (hours to days):
```ts
cache: { ttl: 1000 * 60 * 60 * 24 } // 1 day
```

**Never cache** (realtime data):
```ts
cache: { enabled: false }
```

## Complete Example

```ts
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  ttl: 1000 * 60 * 5,      // Default: 5 minutes
  interpretHeader: true,    // Respect server headers
  etag: true,              // Enable ETag revalidation
  staleIfError: true       // Use stale on errors
});

// Frequently changing data
await axios.get('/api/live-prices', {
  cache: { ttl: 1000 * 10 } // 10 seconds
});

// Static data with server headers
await axios.get('/api/categories', {
  cache: { interpretHeader: true }
  // Server sends Cache-Control: max-age=3600
});

// Force fresh for critical operations
await axios.get('/api/balance', {
  cache: { override: true }
});
```

## Next Steps

- [HTTP Caching Headers](/concepts/http-caching-headers.md) - Understand Cache-Control, ETag, Vary
- [Stale Revalidation](/concepts/stale-revalidation.md) - Deep dive into revalidation patterns
- [TTL Configuration](/api/request-config.md#cache-ttl) - Complete TTL API reference
