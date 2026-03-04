# HTTP Caching Headers

Understanding how axios-cache-interceptor interprets HTTP caching headers.

## Supported Headers

### Cache-Control

The primary header for controlling caching behavior:

```http
Cache-Control: max-age=3600, public
```

**Directives:**
- `max-age=<seconds>` - Maximum time to cache
- `s-maxage=<seconds>` - Shared cache max age
- `no-cache` - Must revalidate before use
- `no-store` - Do not cache at all
- `must-revalidate` - Must revalidate when stale
- `private` - Only cache in browser
- `public` - Can cache in shared caches
- `stale-while-revalidate=<seconds>` - Serve stale while fetching fresh
- `stale-if-error=<seconds>` - Serve stale on errors

### Expires

Absolute expiration time:

```http
Expires: Wed, 21 Oct 2026 07:28:00 GMT
```

Calculates TTL as `Expires - Date.now()`.

### Age

Response age from proxy caches:

```http
Age: 300
```

Subtracts from max-age to determine remaining TTL.

### ETag

Entity tag for revalidation:

```http
ETag: "abc123"
```

Sent in subsequent requests as `If-None-Match: "abc123"`.

### Last-Modified

Resource modification time:

```http
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
```

Sent in subsequent requests as `If-Modified-Since`.

### Vary

Specifies which headers affect caching:

```http
Vary: Authorization, Accept-Language
```

Cache key includes these header values.

## Header Interpretation

### Priority Order

1. `Cache-Control: no-store` → Don't cache
2. `Cache-Control: no-cache` → Don't cache
3. `Cache-Control: max-age` → Use this TTL
4. `Cache-Control: s-maxage` → Use this TTL (server-side)
5. `Expires` → Calculate TTL
6. Configured `ttl` → Use default

### Examples

**Server says cache for 1 hour:**
```http
HTTP/1.1 200 OK
Cache-Control: max-age=3600
```
Library caches for 1 hour regardless of `ttl` config.

**Server says don't cache:**
```http
HTTP/1.1 200 OK
Cache-Control: no-cache
```
Library doesn't cache even if `ttl` is configured.

**Server with stale-while-revalidate:**
```http
HTTP/1.1 200 OK
Cache-Control: max-age=600, stale-while-revalidate=86400
```
Fresh for 10 minutes, can serve stale for 24 hours while revalidating.

## Disabling Header Interpretation

Ignore server headers and use your TTL:

```ts
await axios.get('/api/data', {
  cache: {
    interpretHeader: false,
    ttl: 1000 * 60 * 10 // Use this instead
  }
});
```

## Next Steps

- [Header Interpretation](/concepts/header-interpretation.md) - Implementation details
- [Stale Revalidation](/concepts/stale-revalidation.md) - ETag and If-Modified-Since
- [Vary Header Handling](/concepts/vary-header-handling.md) - Content negotiation
