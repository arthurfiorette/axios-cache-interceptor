# CORS Errors

Fix CORS issues related to cacheTakeover headers.

## The Problem

Error message:
```
Request header field Pragma is not allowed by
Access-Control-Allow-Headers in preflight response.
```

This occurs when `cacheTakeover: true` adds headers that the server's CORS policy doesn't allow.

## What is cacheTakeover?

By default, the library adds these headers to prevent browser caching:
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

This prevents double-caching (both browser and library).

## Quick Fix

### Option 1: Disable cacheTakeover

```ts
await axios.get('https://external-api.com/data', {
  cache: {
    cacheTakeover: false
  }
});
```

### Option 2: Configure Server CORS

Add headers to Access-Control-Allow-Headers:

```js
// Express server
app.use(cors({
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
}));
```

### Option 3: Use Query Parameter

Instead of headers, use cache-busting query param:

```ts
await axios.get(
  `/api/data?cachebuster=${Math.random().toString(36).slice(2)}`,
  {
    id: 'api-data', // Keep same cache key despite different URLs
    cache: {
      cacheTakeover: false
    }
  }
);
```

## Complete Solutions

### Disable Globally

```ts
const axios = setupCache(Axios.create(), {
  cacheTakeover: false
});
```

### Disable for External APIs

```ts
const axios = setupCache(instance);

// Internal API - cacheTakeover enabled (default)
await axios.get('/api/internal/users');

// External API - disable cacheTakeover
await axios.get('https://external-api.com/data', {
  cache: {
    cacheTakeover: false
  }
});
```

### Per-Domain Configuration

```ts
// Create separate instances
const internalAxios = setupCache(Axios.create({
  baseURL: 'https://api.myapp.com'
}), {
  cacheTakeover: true // Prevent browser caching
});

const externalAxios = setupCache(Axios.create({
  baseURL: 'https://external-api.com'
}), {
  cacheTakeover: false // Avoid CORS issues
});
```

## Server CORS Configuration

### Node.js/Express

```js
const cors = require('cors');

app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
}));
```

### Fastify

```js
fastify.register(require('@fastify/cors'), {
  origin: 'https://your-frontend.com',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
});
```

### Nginx

```nginx
add_header Access-Control-Allow-Headers
  "Content-Type, Authorization, Cache-Control, Pragma, Expires";
```

## When to Keep cacheTakeover

Keep enabled (`true`) when:
- You control the backend
- You can update CORS configuration
- Browser caching would interfere
- Working with same-origin requests (no CORS)

## When to Disable cacheTakeover

Disable (`false`) when:
- Using third-party APIs
- Cannot modify CORS configuration
- CORS errors occur
- Browser caching is acceptable

## Alternative Approaches

### Service Worker

Use a service worker instead:

```js
// service-worker.js
self.addEventListener('fetch', (event) => {
  // Prevent browser caching
  const request = new Request(event.request, {
    cache: 'no-cache'
  });

  event.respondWith(fetch(request));
});
```

### HTTP-Only Cookies

For authentication, use HTTP-only cookies instead of Authorization headers to avoid CORS complexity.

## Next Steps

- [cacheTakeover API](/api/request-config.md#cache-cachetakeover) - Complete reference
- [Vary Header](/concepts/vary-header-handling.md) - Header-based caching
- [Production Checklist](/journey/production-checklist.md) - CORS configuration
