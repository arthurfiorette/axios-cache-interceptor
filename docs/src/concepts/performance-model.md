# Performance Model

Understanding the performance characteristics of axios-cache-interceptor.

## Memory Usage

### Default Memory Storage

```ts
const storage = buildMemoryStorage({
  maxEntries: 100 // Typical: 100-1000 entries
});
```

**Per-entry overhead:**
- Cache key: ~50 bytes
- Metadata: ~200 bytes
- Response data: Variable (your data size)
- Total: ~250 bytes + response size

**Example:**
- 100 entries
- Average 5KB response
- Total: 100 × (250 + 5000) = ~525KB

### Web Storage

localStorage/sessionStorage has browser-imposed limits:
- Typical: 5-10MB
- Synchronous API (blocks main thread)
- JSON serialization overhead

### Custom Storage

Redis, IndexedDB: Limited by backend capacity.

## CPU Overhead

### Cache Operations

**Cache key generation:**
- Hash computation: <0.1ms
- Object serialization: <0.1ms

**Storage lookup:**
- Memory: O(1), <0.1ms
- localStorage: Synchronous, 1-5ms
- Redis: Network latency, 10-100ms

**Header interpretation:**
- Parsing: <0.1ms

**Total overhead per request:**
- Cache hit: ~1ms
- Cache miss: ~1-2ms + storage write

Negligible compared to network latency (50-500ms).

## Network Efficiency

### Request Deduplication

**Without caching:**
- 100 concurrent identical requests = 100 network calls
- Total time: Network latency
- Bandwidth: 100 × response size

**With deduplication:**
- 100 concurrent identical requests = 1 network call
- Total time: Network latency
- Bandwidth: 1 × response size
- Savings: 99% bandwidth, 99x fewer server requests

### Bandwidth Savings

**304 Not Modified responses:**
- Full response: 50KB
- 304 response: ~500 bytes
- Savings: 99% bandwidth

**Cache hits:**
- Network requests: 0
- Bandwidth: 0
- Savings: 100%

## Benchmarks

From official benchmarks:

**Requests per second:**
- Vanilla Axios: ~21,000 req/s
- With cache (cold): ~18,000 req/s (14% overhead)
- With cache (hot): ~450,000 req/s (21x faster)

**Latency:**
- Vanilla Axios: 0.05ms
- Cache miss: 0.06ms (+0.01ms overhead)
- Cache hit: 0.002ms (25x faster)

## Memory Leak Prevention

**Unbounded growth prevention:**

```ts
const storage = buildMemoryStorage({
  maxEntries: 100,      // Limit total entries
  maxStaleAge: 3600000, // Auto-delete stale after 1 hour
  cleanupInterval: 300000 // Clean every 5 minutes
});
```

**FIFO eviction:**
- When maxEntries reached
- Oldest entry removed
- Prevents unbounded growth

## Optimization Strategies

### 1. Set Appropriate Limits

```ts
// Small app
maxEntries: 50

// Medium app
maxEntries: 200

// Large app
maxEntries: 500-1000
```

### 2. Use Persistent Storage

```ts
// Browser
storage: buildWebStorage(localStorage)

// Server
storage: redisStorage
```

Prevent re-fetching on page reload.

### 3. Tune TTL

```ts
// Frequently changing: short TTL
cache: { ttl: 1000 * 30 } // 30 seconds

// Static data: long TTL
cache: { ttl: 1000 * 60 * 60 } // 1 hour
```

### 4. Enable Header Interpretation

```ts
interpretHeader: true // Let server control caching
```

### 5. Use ETag Revalidation

```ts
etag: true // Save bandwidth with 304 responses
```

## Monitoring

### Track Cache Hit Rate

```ts
let hits = 0, misses = 0;

axios.interceptors.response.use((response) => {
  if (response.cached) hits++;
  else misses++;

  const hitRate = hits / (hits + misses);
  console.log('Hit rate:', (hitRate * 100).toFixed(2) + '%');

  return response;
});
```

### Monitor Memory Usage

```ts
// Get cache size
const cacheSize = await axios.storage.clear?.length;

// Estimate memory
const estimatedMemory = cacheSize * 5000; // Assume 5KB avg
console.log('Estimated cache memory:', estimatedMemory / 1024 / 1024, 'MB');
```

### Performance Metrics

```ts
const start = performance.now();
const response = await axios.get('/api/data');
const duration = performance.now() - start;

console.log({
  cached: response.cached,
  duration: duration + 'ms',
  hitRate: calculateHitRate()
});
```

## Production Recommendations

**Memory:**
- Set maxEntries based on available memory
- Enable cleanup intervals
- Use persistent storage for long-lived apps

**CPU:**
- Minimal overhead, no special tuning needed
- Consider custom key generator for very high throughput

**Network:**
- Enable ETag revalidation
- Set appropriate TTLs
- Monitor hit rate (target >70%)

## Next Steps

- [Storage Architecture](/concepts/storage-architecture.md) - Storage design
- [Production Checklist](/journey/production-checklist.md) - Deployment guide
- [Benchmarks](/generated/benchmark.md) - Official benchmarks
