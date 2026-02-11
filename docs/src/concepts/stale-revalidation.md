# Stale Revalidation

How ETag and If-Modified-Since enable efficient cache revalidation.

## What is Revalidation?

Instead of fetching full response data when cache expires, ask the server "has this changed?"

**Without revalidation:**
- Cache expires
- Fetch entire resource again
- Waste bandwidth if data unchanged

**With revalidation:**
- Cache expires
- Ask server if changed
- Server responds 304 Not Modified
- Keep existing cache, extend TTL
- Save bandwidth

## ETag Revalidation

### How It Works

**Step 1:** First request
```http
GET /api/users
→ 200 OK
ETag: "abc123"
{ "users": [...] }
```

Library stores ETag with cached data.

**Step 2:** Cache expires, revalidation request
```http
GET /api/users
If-None-Match: "abc123"
```

**Step 3:** Server response
```http
→ 304 Not Modified
```

No response body, library keeps existing cache.

### Configuration

Enabled by default:

```ts
const axios = setupCache(instance, {
  etag: true // Default
});
```

Disable if server doesn't support:

```ts
const axios = setupCache(instance, {
  etag: false
});
```

Custom static ETag:

```ts
await axios.get('/api/data', {
  cache: {
    etag: '"custom-etag"'
  }
});
```

## If-Modified-Since Revalidation

Alternative for servers without ETag support.

### How It Works

**Step 1:** First request
```http
GET /api/users
→ 200 OK
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
{ "users": [...] }
```

**Step 2:** Cache expires, revalidation
```http
GET /api/users
If-Modified-Since: Wed, 21 Oct 2026 07:28:00 GMT
→ 304 Not Modified
```

### Configuration

```ts
const axios = setupCache(instance, {
  etag: false,
  modifiedSince: true
});
```

## Stale-While-Revalidate

Serve stale cache while revalidating in background.

### Server Configuration

```http
Cache-Control: max-age=600, stale-while-revalidate=86400
```

Means:
- Fresh for 10 minutes
- After 10 minutes, serve stale for up to 24 hours
- Make background request for fresh data

### How It Works

**Within TTL (0-10 minutes):**
- Serve cache immediately
- No network request

**After TTL, within stale window (10min-24hr):**
- Serve stale cache immediately
- Make background revalidation request
- Update cache when response arrives
- User gets instant response

**After stale window (>24hr):**
- Wait for network request
- Don't serve stale cache

## Hydrate Pattern

Update UI immediately with stale data while fetching fresh:

```ts
await axios.get('/api/users', {
  cache: {
    hydrate: (staleCache) => {
      // Update UI with stale data immediately
      updateUI(staleCache.data);
      console.log('Showing stale data, fetching fresh...');
    }
  }
});

// After network request completes
console.log('UI updated with fresh data');
```

## Must-Revalidate

Force revalidation even if stale:

```http
Cache-Control: max-age=600, must-revalidate
```

After 600 seconds:
- Must validate with server before using
- Cannot serve stale
- 304 response extends cache

## Benefits

**Bandwidth Savings:**
- 304 responses have no body
- Save megabytes for large responses
- Especially valuable on mobile

**Performance:**
- Instant response with stale data
- Background revalidation
- Better UX than loading spinners

**Server Load:**
- 304 responses cheaper to generate
- No database queries needed
- Just timestamp/hash comparison

## Complete Example

```ts
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  etag: true,
  staleWhileRevalidate: true
});

// First request
const res1 = await axios.get('/api/users');
// → 200 OK, ETag: "abc123"

// Wait for cache to expire...

// Second request
const res2 = await axios.get('/api/users', {
  cache: {
    hydrate: (stale) => {
      console.log('Showing stale data');
      updateUI(stale.data);
    }
  }
});
// → If-None-Match: "abc123"
// → 304 Not Modified
// UI updated twice: once with stale, once with fresh

console.log(res2.stale); // May be true initially
```

## Next Steps

- [HTTP Caching Headers](/concepts/http-caching-headers.md) - Header reference
- [Storage States](/concepts/storage-states.md) - Stale state explained
- [ETag Configuration](/api/request-config.md#cache-etag) - API reference
