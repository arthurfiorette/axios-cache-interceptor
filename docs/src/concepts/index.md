# Core Concepts

This section explains how axios-cache-interceptor works internally. Understanding these concepts will help you make better decisions about caching strategy and troubleshoot issues more effectively.

## Fundamental Concepts

Start with these core concepts to build your mental model:

- [How It Works](./how-it-works.md) - High-level architecture and request flow
- [Request Lifecycle](./request-lifecycle.md) - Detailed request/response flow diagram
- [Storage States](./storage-states.md) - Understanding cache states (empty, cached, stale, loading)

## Caching Mechanisms

Learn about the key mechanisms that make caching work:

- [Request Deduplication](./request-deduplication.md) - How concurrent requests are handled
- [Cache Keys](./cache-keys.md) - How request IDs are generated
- [HTTP Caching Headers](./http-caching-headers.md) - Cache-Control, ETag, Vary explained

## Advanced Concepts

Deep dive into advanced caching patterns:

- [Storage Architecture](./storage-architecture.md) - Storage interface design patterns
- [Header Interpretation](./header-interpretation.md) - How headers determine TTL
- [Stale Revalidation](./stale-revalidation.md) - ETag and If-Modified-Since patterns
- [Vary Header Handling](./vary-header-handling.md) - Content negotiation and cache keys
- [Performance Model](./performance-model.md) - Memory, network, and computation characteristics

## Why These Concepts Matter

Understanding these concepts helps you:

- Choose the right caching strategy for your use case
- Debug cache misses and unexpected behavior
- Optimize performance and memory usage
- Implement custom storage adapters correctly
- Make informed decisions about TTL and revalidation

## Related Resources

- [User Journey](/journey/) - Task-oriented implementation guides
- [API Reference](/api/) - Technical documentation
- [Examples](/examples/) - See concepts in practice
