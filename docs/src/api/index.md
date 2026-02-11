# API Reference

Complete technical reference for all axios-cache-interceptor configuration options, interfaces, and types.

## Core API

The main functions and configuration options:

- [setupCache()](./setup-cache.md) - Initialize caching on an Axios instance
- [Request Config](./request-config.md) - Per-request cache configuration
- [Response Object](./response-object.md) - Properties available on cached responses
- [Cache Properties](./cache-properties.md) - All available CacheProperties options

## Storage

Storage adapter interfaces and implementations:

- [Storage Interface](./storage-interface.md) - AxiosStorage interface specification
- [buildMemoryStorage()](./memory-storage.md) - In-memory storage adapter
- [buildWebStorage()](./web-storage.md) - localStorage/sessionStorage adapter
- [buildStorage()](./build-storage.md) - Create custom storage adapters

## Advanced Interfaces

Advanced customization interfaces:

- [Key Generator](./key-generator.md) - Custom request ID generation
- [Header Interpreter](./header-interpreter.md) - Custom header interpretation
- [Cache Predicate](./cache-predicate.md) - Custom cacheability tests
- [TypeScript Types](./typescript-types.md) - Complete type reference

## Quick Reference

### Default Values

| Option | Default | Description |
|--------|---------|-------------|
| `ttl` | `300000` (5 min) | Time to live in milliseconds |
| `methods` | `['get', 'head']` | Cacheable HTTP methods |
| `interpretHeader` | `true` | Parse Cache-Control headers |
| `etag` | `true` | ETag validation |
| `modifiedSince` | `false` | If-Modified-Since header |
| `vary` | `true` | Vary header handling |
| `staleIfError` | `true` | Return stale on error |
| `enabled` | `true` | Cache enabled |

### Common Patterns

```ts
// Basic setup
const axios = setupCache(Axios.create());

// Custom TTL
axios.get('/api/data', { cache: { ttl: 60000 } });

// Disable cache for specific request
axios.get('/api/realtime', { cache: { enabled: false } });

// Cache POST requests
setupCache(instance, { methods: ['get', 'post'] });
```

## Related Resources

- [User Journey](/journey/) - Learn how to use these APIs
- [Concepts](/concepts/) - Understand how they work
- [Examples](/examples/) - See them in action
