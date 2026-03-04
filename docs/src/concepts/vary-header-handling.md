# Vary Header Handling

How the Vary header affects cache keys and prevents cache poisoning.

## What is Vary?

The Vary header tells caches which request headers affect the response:

```http
HTTP/1.1 200 OK
Vary: Authorization, Accept-Language
```

This means:
- Response varies based on Authorization header
- Response varies based on Accept-Language header
- Different header values need separate cache entries

## Why It Matters

**Without Vary handling (cache poisoning):**

```ts
// User A requests with token A
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-A' }
});
// Cached with key: "/api/profile"

// User B requests with token B
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-B' }
});
// Returns cached data from User A (WRONG!)
```

**With Vary handling:**

```ts
// User A
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-A' }
});
// Key: "/api/profile" + {authorization: 'Bearer token-A'}

// User B
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-B' }
});
// Key: "/api/profile" + {authorization: 'Bearer token-B'}
// Separate cache entries - correct!
```

## How It Works

### Step 1: Server Response

```http
HTTP/1.1 200 OK
Vary: Authorization
ETag: "abc123"
```

Library extracts: `Vary: Authorization`

### Step 2: Cache Storage

Library stores:
```ts
{
  state: 'cached',
  data: response,
  meta: {
    vary: {
      authorization: 'Bearer token-A'
    }
  }
}
```

### Step 3: Subsequent Request

```ts
// Same endpoint, different auth
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-B' }
});
```

Library:
1. Generates initial cache key
2. Checks cached Vary headers
3. Sees Authorization header is different
4. Generates new cache key including header
5. Makes new request (cache miss)

## Configuration

### Automatic Vary (Default)

Enabled by default:

```ts
const axios = setupCache(instance, {
  vary: true // Automatic handling
});
```

### Override Vary

Force specific headers regardless of server:

```ts
await axios.get('/api/content', {
  cache: {
    vary: ['accept-language', 'accept-encoding']
  }
});
```

### Disable Vary (Dangerous)

```ts
await axios.get('/api/public', {
  cache: {
    vary: false // WARNING: Can cause cache poisoning
  }
});
```

Only disable if:
- Response is truly the same for all requests
- No user-specific data
- No authentication involved

## Vary: *

Special value meaning "varies by everything":

```http
Vary: *
```

Library behavior:
- Marks cache as immediately stale
- Forces revalidation every time
- Prevents shared caching

## Common Vary Headers

### Authorization

Most common, for authenticated endpoints:

```http
Vary: Authorization
```

Different users get different cache entries.

### Accept-Language

For localized content:

```http
Vary: Accept-Language
```

Different languages cached separately.

### Accept-Encoding

For different compressions:

```http
Vary: Accept-Encoding
```

Gzip vs Brotli cached separately.

### Multiple Headers

```http
Vary: Authorization, Accept-Language, Accept-Encoding
```

All three headers included in cache key.

## Performance Impact

**More Vary headers = More cache entries:**

```http
Vary: Authorization, Accept-Language, User-Agent
```

With:
- 10 users
- 5 languages
- 3 user agents

Potential cache entries: 10 × 5 × 3 = 150

Consider memory usage with many Vary headers.

## Debug Vary Issues

Enable debug mode:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});
```

Look for:
```
[123456] Vary mismatch detected
Expected: {authorization: 'Bearer token-A'}
Got: {authorization: 'Bearer token-B'}
```

## Security Best Practices

**Always enable Vary handling:**

```ts
const axios = setupCache(instance, {
  vary: true // Never disable globally
});
```

**Validate server Vary headers:**
- Ensure server sends Vary for auth endpoints
- Test with different users
- Check for cache poisoning

**Per-request override only when safe:**
```ts
// Safe: public static data
await axios.get('/api/countries', {
  cache: { vary: false }
});

// Unsafe: user data
await axios.get('/api/profile', {
  cache: { vary: false } // DON'T DO THIS
});
```

## Next Steps

- [Cache Keys](/concepts/cache-keys.md) - How keys are generated
- [HTTP Caching Headers](/concepts/http-caching-headers.md) - Vary header details
- [Vary Configuration](/api/request-config.md#cache-vary) - API reference
